import { Body, Controller, Get, HttpCode, HttpService, HttpStatus, Inject, Logger, Param, Query, Redirect, Req, Res } from "@nestjs/common";
import AttributeCheckerService from "./attributeChecker.service";
import { ParticipationService } from "../participation/participation.service";
import { AttributesService } from "./attributes.service";

const CYBER_URI = "https://ssotest.topid.org";
const CYBER_USER = "test_client_ngrok";
const NONCE = "123455";
const LOA = "1";
const SCOPE = "phone_numbers";

const MY_URL = "http://20.82.90.82:8080";

const MOCK_ATTRIBUTES = {
    valid: {
        age: 20,
        zipCode: '05-075',
    }
}

/* oAuth Controller for Cyber **/
@Controller('oauth')
export default class oAuthController {

    constructor(
        private readonly http: HttpService,
        private readonly attributesService: AttributesService,
        private readonly attributeChecker: AttributeCheckerService,
        private readonly participationService: ParticipationService
    ) { }

    @Get('flow/:asaId/:userId')
    async flow(@Query('code') code: string, @Param('asaId') asaEntityID: number, @Param('userId') userId: number, @Res() res) {
        const response = await this.http.post(`${CYBER_URI}/oauth2/token`, {
            "client_id": CYBER_USER,
            "code": code,
            "redirect_uri": this.oAuthCyberRedirectUrl(asaEntityID, userId),
            "grant_type": "authorization_code",
            "client_secret": "abc"
        }).toPromise();

        Logger.debug(`Received data from CyberID ${JSON.stringify(response.data, undefined, 4)}`, oAuthController.name);

        const requiredAttributes = await this.attributesService.getRequiredByAsaEntityID(asaEntityID);

        const isPositive = await this.attributeChecker.check(requiredAttributes, MOCK_ATTRIBUTES.valid);

        if (isPositive) {
            await this.participationService.participateUser(userId, asaEntityID, 100);
        }

        res.redirect('http://localhost:3000/home');
    }

    @Get('redirect/:asaId/:userId')
    redirectUri(@Param('asaId') asaId: number, @Param('userId') userId: number) {
        const url = `${CYBER_URI}/oauth2/auth?client_id=${CYBER_USER}&redirect_uri=${this.oAuthCyberRedirectUrl(asaId, userId)}&response_type=code&scope=${SCOPE}&nonce=${NONCE}&loa=${LOA}`;

        return Promise.resolve({ url })
    }


    oAuthCyberRedirectUrl(asaId: number, userId: number): string {
        return `${MY_URL}/oauth/flow/${asaId.toString()}/${userId.toString()}`;
    }
}