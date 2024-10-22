import { LightningElement } from 'lwc';
import CONTACT_OBJECT from '@salesforce/schema/Contact';
import NAME_FIELD from '@salesforce/schema/Contact.Name';   
import TITLE_FIELD from '@salesforce/schema/Contact.Title';
import PHONE_FIELD from '@salesforce/schema/Contact.Phone';
import EMAIL_FIELD from '@salesforce/schema/Contact.Email';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class LightningRecordEditForm extends LightningElement {
 
    objectName = CONTACT_OBJECT
    fields = {
        nameField : NAME_FIELD,
        titleField : TITLE_FIELD,
        phoneField : PHONE_FIELD,
        emailField : EMAIL_FIELD
    }

    handleReset()
      {
    const inputfields = this.template.querySelectorAll('lightning-input-field');
       if(inputfields){
        Array.from(inputfields).forEach(field=>{
            field.reset();
        })
       }
       
    }
    handleSuccess(event) {
        console.log('COntact created');
         this.showToastMsg('Success', 'Contacts Updated', 'success');
    }

handleError(event){
        //const error = event.detail.error;
        console.log('event.detail.error',event);
        console.log('event.detail.error',event.detail.message);
   this.showToastMsg('Error',event.detail.message,'error');
 }

showToastMsg(title, message, variant) {
    this.dispatchEvent(
        new ShowToastEvent({
            title: title,
            message: message,
            variant: variant
        })
    );
}
}

