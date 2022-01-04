import { Box, Button } from "@material-ui/core";
import { default as React } from "react";
import { useHistory } from "react-router-dom";
import { CREATE_ASA } from "../../Constants/routes";
import { AsaList } from "../Asa/AsaList";

const AdminView: React.FC = () => {
    const history = useHistory();

    const createVoucher = () => {
        history.push(CREATE_ASA);
    };

    return (
        <Box display="flex" width="100%" flexDirection="column" >
            <AsaList ></AsaList>
            <Box mt={3} width="100%" display="flex" flexDirection="column" justifyContent="center" >
                <Button
                    variant="contained"
                    color="secondary"
                    onClick={createVoucher}>
                    Create new voucher
                    </Button>
            </Box>
        </Box>
    );
}

export { AdminView };

