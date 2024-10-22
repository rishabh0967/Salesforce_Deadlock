import { LightningElement,api } from 'lwc';

export default class PdfGeneration extends LightningElement {
    @api recordId;

    get acceptedFormats() {
        return ['.pdf', '.png'];
    }

    handleUploadFinished(event) {
        // Get the list of uploaded files
        const uploadedFiles = event.detail.files;
        console.log('uploadedFiles',uploadedFiles);
    }

}