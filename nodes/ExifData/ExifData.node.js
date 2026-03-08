"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExifData = void 0;
const n8n_workflow_1 = require("n8n-workflow");
const exiftool_vendored_1 = require("exiftool-vendored");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const os = __importStar(require("os"));
class ExifData {
    constructor() {
        this.description = {
            displayName: 'ExifData',
            name: 'exifData',
            group: ['transform'],
            icon: { light: 'file:exif-node.svg', dark: 'file:exif-node.dark.svg' },
            version: 1,
            description: 'Read and Write EXIF Data from and to Image Files',
            defaults: {
                name: 'EXIF Data',
            },
            inputs: ["main"],
            outputs: ["main"],
            properties: [
                {
                    displayName: 'Operation',
                    name: 'operation',
                    type: 'options',
                    noDataExpression: true,
                    options: [
                        {
                            name: 'Read',
                            value: 'read',
                            description: 'Read EXIF Data from an Image File',
                        },
                        {
                            name: 'Write',
                            value: 'write',
                            description: 'Write EXIF Data to an Image File',
                        },
                        {
                            name: 'Repair',
                            value: 'repair',
                            description: 'Repair EXIF Data of an Image File. Might help with corrupted files.',
                        },
                        {
                            name: 'Delete',
                            value: 'delete',
                            description: 'Delete ALL EXIF Data from an Image File. Optionally you can provide a list of tags to keep.',
                        },
                        {
                            name: 'Send Custom Exiftool Command',
                            value: 'customCmd',
                            description: 'Send a custom Exiftool Command with custom parameters',
                        },
                    ],
                    default: 'read',
                },
                {
                    displayName: 'Input Source',
                    name: 'inputSource',
                    type: 'options',
                    options: [
                        {
                            name: 'Binary Property',
                            value: 'binary',
                        },
                        {
                            name: 'File Path',
                            value: 'filePath',
                        },
                    ],
                    default: 'binary',
                    description: 'Choose whether the input image comes from binary data or from a file path',
                },
                {
                    displayName: 'Property Name',
                    name: 'dataPropertyName',
                    type: 'string',
                    default: 'data',
                    required: true,
                    description: 'Name of the binary property in which the image data can be found',
                    displayOptions: {
                        show: {
                            inputSource: ['binary'],
                        },
                    },
                },
                {
                    displayName: 'Input File Path',
                    name: 'inputFilePath',
                    type: 'string',
                    default: '',
                    required: true,
                    placeholder: 'C:\\images\\photo.jpg',
                    description: 'Absolute path of the source image file',
                    displayOptions: {
                        show: {
                            inputSource: ['filePath'],
                        },
                    },
                },
                {
                    displayName: 'Output Type',
                    name: 'outputType',
                    type: 'options',
                    options: [
                        {
                            name: 'Binary Property',
                            value: 'binary',
                        },
                        {
                            name: 'File Path',
                            value: 'filePath',
                        },
                    ],
                    default: 'binary',
                    description: 'Choose whether the result should be returned as binary data or as a file path',
                },
                {
                    displayName: 'Output Property Name',
                    name: 'outputPropertyName',
                    type: 'string',
                    default: 'exifData',
                    description: 'Name of the property in which the EXIF Data or EXIF result will be stored',
                },
                {
                    displayName: 'Output File Path Property Name',
                    name: 'outputFilePathPropertyName',
                    type: 'string',
                    default: 'processedFilePath',
                    description: 'Name of the JSON property in which the processed file path will be stored',
                    displayOptions: {
                        show: {
                            outputType: ['filePath'],
                        },
                    },
                },
                {
                    displayName: 'Custom Exiftool Command',
                    name: 'customCmd',
                    type: 'string',
                    default: '',
                    placeholder: "e.g. -all",
                    description: 'Send a custom Exiftool Command with custom parameters. The File will be automatically added as last parameter.',
                    displayOptions: {
                        show: {
                            operation: ['customCmd'],
                        },
                    },
                },
                {
                    displayName: 'List of Tags to Keep',
                    name: 'keepTags',
                    type: 'string',
                    default: '',
                    placeholder: "Keywords, Subject, Author, ICC_Profile, etc.",
                    description: 'Provide a list of tags to keep. Tags will be kept as is, other tags will be deleted.',
                    displayOptions: {
                        show: {
                            operation: ['delete'],
                        },
                    },
                },
                {
                    displayName: "Some fields like 'Keywords' or 'Subject' can be formatted as a list. Provide them as a comma separated list (With Option: Parse Input Fields). You can also provide them as Array utilizing an Expression.",
                    name: 'noticeTagFormats',
                    type: 'notice',
                    default: '',
                    displayOptions: {
                        show: {
                            operation: ['write'],
                        },
                    },
                },
                {
                    displayName: "Usually the Metadata tags are formatted in <strong>PascalCase</strong>. To write to a specific metadata group's tag, just prefix the tag name with the group. (e.g. <code>IPTC:CopyrightNotice</code>)<br><br>A list of all possible tags can be found <a href='https://exiftool.org/TagNames/EXIF.html' target='_blank'>here</a>.",
                    name: 'noticeKeywords',
                    type: 'notice',
                    default: '',
                    displayOptions: {
                        show: {
                            operation: ['write'],
                        },
                    },
                },
                {
                    displayName: "This will delete all EXIF Data from the file. If you want to retain some tags, you can provide a list of tags to keep. Some Tags may be wise to keep, like <code>ICC_Profile</code>.",
                    name: 'noticeDelete',
                    type: 'notice',
                    default: '',
                    displayOptions: {
                        show: {
                            operation: ['delete'],
                        },
                    },
                },
                {
                    displayName: "<strong>Tip!</strong> You can also delete specific tags with the <strong>Write</strong> Operation when writing an empty (null) value to the desired tag.",
                    name: 'noticeDeleteWithWrite',
                    type: 'notice',
                    default: '',
                    displayOptions: {
                        show: {
                            operation: ['delete', 'write'],
                        },
                    },
                },
                {
                    displayName: 'EXIF-Metadata',
                    name: 'exifMetadata',
                    placeholder: 'Add Metadata',
                    type: 'fixedCollection',
                    default: '',
                    typeOptions: {
                        multipleValues: true,
                    },
                    description: '',
                    options: [
                        {
                            name: 'metadataValues',
                            displayName: 'Metadata',
                            values: [
                                {
                                    displayName: 'Name',
                                    name: 'name',
                                    type: 'string',
                                    default: '',
                                    description: 'Name of the metadata key to add.',
                                },
                                {
                                    displayName: 'Value',
                                    name: 'value',
                                    type: 'string',
                                    default: '',
                                    description: 'Value to set for the metadata key.',
                                },
                            ],
                        },
                    ],
                    displayOptions: {
                        show: {
                            operation: ['write'],
                        },
                    },
                },
                {
                    displayName: 'Options',
                    name: 'options',
                    type: 'collection',
                    placeholder: 'Add option',
                    default: {},
                    options: [
                        {
                            displayName: 'Read Raw',
                            name: 'readRaw',
                            type: 'boolean',
                            default: false,
                            description: 'Return the EXIF Data raw, untransformed and unstandardized.',
                        },
                        {
                            displayName: 'Parse Input Fields',
                            name: 'parseInputFields',
                            type: 'boolean',
                            default: true,
                            description: 'Input fields will be parsed to match desired EXIF tags. (e.g.: "Keywords" and "Subject" will parse comma separated values)',
                        }
                    ],
                },
            ],
        };
    }
    async execute() {
        const items = this.getInputData();
        for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
            let temporaryFilePath;
            let processedFilePath;
            let tempDirPath;
            try {
                const operation = this.getNodeParameter('operation', itemIndex);
                const options = this.getNodeParameter('options', itemIndex);
                const inputSource = this.getNodeParameter('inputSource', itemIndex);
                const outputType = this.getNodeParameter('outputType', itemIndex);
                const outputPropertyName = this.getNodeParameter('outputPropertyName', itemIndex);
                const outputFilePathPropertyName = this.getNodeParameter('outputFilePathPropertyName', itemIndex);
                if (inputSource === 'binary' && outputType === 'filePath') {
                    throw new n8n_workflow_1.NodeOperationError(this.getNode(), 'Output Type "File Path" requires Input Source "File Path".', {
                        itemIndex,
                    });
                }
                const supportedExtensions = ['jpg', 'jpeg', 'png', 'heic', 'heif', 'tiff', 'gif', 'bmp', 'webp'];
                let binaryPropertyName;
                let binaryData;
                let extension;
                let cleanedBinaryPropertyName;
                let originalFileStats;
                if (inputSource === 'binary') {
                    binaryPropertyName = this.getNodeParameter('dataPropertyName', itemIndex);
                    binaryData = this.helpers.assertBinaryData(itemIndex, binaryPropertyName);
                    extension = (binaryData.fileExtension || '').toLowerCase();
                    cleanedBinaryPropertyName = binaryPropertyName.replace(/[^a-zA-Z0-9]/g, '');
                    const inputBuffer = await this.helpers.getBinaryDataBuffer(itemIndex, binaryPropertyName);
                    const tempFolderName = 'n8n-exif-' + Date.now() + '-' + itemIndex + '-' + Math.random().toString(36).slice(2, 10);
                    tempDirPath = path.join(os.tmpdir(), tempFolderName);
                    fs.mkdirSync(tempDirPath, { recursive: true });
                    temporaryFilePath = path.join(tempDirPath, cleanedBinaryPropertyName + '.' + extension);
                    if (fs.existsSync(temporaryFilePath + '_exiftool_tmp')) {
                        fs.unlinkSync(temporaryFilePath + '_exiftool_tmp');
                    }
                    fs.writeFileSync(temporaryFilePath, inputBuffer, {
                        flag: 'w'
                    });
                    if (!fs.readFileSync(temporaryFilePath)) {
                        throw new n8n_workflow_1.NodeOperationError(this.getNode(), 'Failed to write binary data to temporary file', {
                            itemIndex,
                        });
                    }
                }
                else {
                    temporaryFilePath = this.getNodeParameter('inputFilePath', itemIndex);
                    if (!temporaryFilePath || !fs.existsSync(temporaryFilePath)) {
                        throw new n8n_workflow_1.NodeOperationError(this.getNode(), 'Input file does not exist: ' + temporaryFilePath, {
                            itemIndex,
                        });
                    }
                    const inputFileExtension = path.extname(temporaryFilePath).replace('.', '').toLowerCase();
                    extension = inputFileExtension;
                    cleanedBinaryPropertyName = path.basename(temporaryFilePath, path.extname(temporaryFilePath)).replace(/[^a-zA-Z0-9]/g, '') || 'image';
                    originalFileStats = fs.statSync(temporaryFilePath);
                }
                if (!extension || !supportedExtensions.includes(extension)) {
                    throw new n8n_workflow_1.NodeOperationError(this.getNode(), 'File extension ' + extension + ' is not supported', {
                        itemIndex,
                    });
                }
                if (operation === 'read') {
                    if (!options.readRaw) {
                        const exifData = await exiftool_vendored_1.exiftool.readRaw(temporaryFilePath);
                        items[itemIndex].json[outputPropertyName] = exifData;
                    }
                    else {
                        const exifData = await exiftool_vendored_1.exiftool.read(temporaryFilePath, {});
                        items[itemIndex].json[outputPropertyName] = exifData;
                    }
                }
                if (operation === 'write') {
                    const exifMetadata = this.getNodeParameter('exifMetadata', itemIndex);
                    if (fs.existsSync(temporaryFilePath + '_exiftool_tmp')) {
                        console.log('EXIF NODE: Temporary file already exists. Please wait for the previous operation to finish.');
                    }
                    if (!exifMetadata.metadataValues.length) {
                        throw new n8n_workflow_1.NodeOperationError(this.getNode(), 'No metadata values provided. Please provide at least one metadata value.', {
                            itemIndex,
                        });
                    }
                    const tags = exifMetadata.metadataValues.map((tag) => {
                        if (options.parseInputFields) {
                            let splittedTag = tag.name.split(':');
                            if (splittedTag.indexOf('Keywords') != -1) {
                                tag.value = tag.value.split(',');
                            }
                            else if (splittedTag.indexOf('Subject') != -1) {
                                tag.value = tag.value.split(',');
                            }
                        }
                        return {
                            [tag.name]: tag.value
                        };
                    });
                    const exifResults = await Promise.all(tags.map(async (tag) => {
                        const result = await exiftool_vendored_1.exiftool.write(temporaryFilePath, tag, ['-overwrite_original_in_place', '-P']);
                        await new Promise(resolve => setTimeout(resolve, 500));
                        return {
                            ...result,
                            tag: Object.keys(tag)[0]
                        };
                    }));
                    items[itemIndex].json[outputPropertyName] = exifResults;
                }
                if (operation === 'delete') {
                    const keepTags = this.getNodeParameter('keepTags', itemIndex);
                    const keepTagsArray = (keepTags.length) ? keepTags.split(',').map((tag) => tag.trim()) : [];
                    const exifDataResult = await exiftool_vendored_1.exiftool.deleteAllTags(temporaryFilePath, (keepTagsArray.length) ? {
                        retain: keepTagsArray
                    } : undefined);
                    items[itemIndex].json[outputPropertyName] = exifDataResult;
                }
                if (operation === 'repair') {
                    await exiftool_vendored_1.exiftool.rewriteAllTags(temporaryFilePath, temporaryFilePath + '_processed');
                    items[itemIndex].json[outputPropertyName] = { success: true };
                }
                if (operation === 'customCmd') {
                    const customCmd = this.getNodeParameter('customCmd', itemIndex);
                    const isWriteCmd = customCmd.includes('=');
                    const commandArray = customCmd.split(' ');
                    let exifResult = {};
                    if (!isWriteCmd) {
                        exifResult = await exiftool_vendored_1.exiftool.readRaw(temporaryFilePath, commandArray);
                    }
                    else {
                        throw new n8n_workflow_1.NodeOperationError(this.getNode(), 'Write Custom Commands are not supported yet. Please use the Write Operation instead.', {
                            itemIndex,
                        });
                    }
                    if (exifResult) {
                        items[itemIndex].json[outputPropertyName] = exifResult;
                    }
                    else {
                        items[itemIndex].json[outputPropertyName] = {};
                    }
                }
                processedFilePath = temporaryFilePath;
                if (fs.existsSync(temporaryFilePath + '_processed')) {
                    processedFilePath = temporaryFilePath + '_processed';
                }
                // Preserve filesystem timestamps from the original source file.
                try {
                    const sourceStats = originalFileStats || fs.statSync(temporaryFilePath);
                    if (sourceStats && sourceStats.atime && sourceStats.mtime) {
                        fs.utimesSync(processedFilePath, sourceStats.atime, sourceStats.mtime);
                    }
                } catch (error) {
                    console.warn('Could not preserve file timestamps:', error.message);
                }

                if (outputType === 'filePath') {
                    items[itemIndex].json[outputFilePathPropertyName] = processedFilePath;
                }
                else {
                    const fileData = fs.readFileSync(processedFilePath);
                    let outputFileName;
                    let mimeType;
                    if (binaryData) {
                        outputFileName = binaryData.fileName || (cleanedBinaryPropertyName + '.' + extension);
                        mimeType = binaryData.mimeType;
                    }
                    else {
                        outputFileName = path.basename(processedFilePath);
                        mimeType = undefined;
                    }
                    const binaryDataModified = await this.helpers.prepareBinaryData(fileData, outputFileName, mimeType);
                    if (!items[itemIndex].binary) {
                        items[itemIndex].binary = {};
                    }
                    const outputBinaryPropertyName = binaryPropertyName || 'data';
                    items[itemIndex].binary[outputBinaryPropertyName] = binaryDataModified;
                }
                if (tempDirPath && fs.existsSync(tempDirPath)) {
                    fs.rmSync(tempDirPath, { recursive: true, force: true });
                }
            }
            catch (error) {
                try {
                    if (tempDirPath && fs.existsSync(tempDirPath)) {
                        fs.rmSync(tempDirPath, { recursive: true, force: true });
                    }
                }
                catch (error) {
                    console.error('EXIF NODE: Failed to clean up temporary files', error);
                }
                if (this.continueOnFail()) {
                    items.push({ json: this.getInputData(itemIndex)[0].json, error, pairedItem: itemIndex });
                }
                else {
                    if (error.context) {
                        error.context.itemIndex = itemIndex;
                        throw error;
                    }
                    throw new n8n_workflow_1.NodeOperationError(this.getNode(), error, {
                        itemIndex,
                    });
                }
            }
        }
        return [items];
    }
}
exports.ExifData = ExifData;
//# sourceMappingURL=ExifData.node.js.map
