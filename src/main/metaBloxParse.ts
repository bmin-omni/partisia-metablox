import * as fs from 'fs';
import { AbiParser, FileAbi } from "@partisiablockchain/abi-client";

var filePath: string = 'xiaoyi_did.abi';
const fileAbi: FileAbi = new AbiParser(fs.readFileSync(filePath)).parseAbi();

console.log(fileAbi);
console.log(fileAbi.contract);