import { Injectable } from "@nestjs/common";
import { PathLike, promises as fs } from "fs";
import * as pathUtils from 'path';

@Injectable()
export default class FileReader {

    private readonly basePath: PathLike = process.cwd();

    async read(path: PathLike) {

        const resolvedPath = pathUtils.join(this.basePath.toString(), path.toString());

        return (await fs.readFile(resolvedPath)).toString();
    }
}