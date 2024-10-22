import { LightningElement,api,track, wire } from 'lwc';
import CONTACT_OBJECT from '@salesforce/schema/Contact';
import NAME_FIELD from '@salesforce/schema/Contact.Name';   
import TITLE_FIELD from '@salesforce/schema/Contact.Title';
import PHONE_FIELD from '@salesforce/schema/Contact.Phone';
import EMAIL_FIELD from '@salesforce/schema/Contact.Email';
import FIRST_FIELD from '@salesforce/schema/Contact.FirstName';
import LAST_FIELD from '@salesforce/schema/Contact.LastName';
import OWNER_FIELD from '@salesforce/schema/Contact.UserId__c';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import queryContacts from '@salesforce/apex/AccountHelper.queryContacts';
import { createRecord } from 'lightning/uiRecordApi';
import createContactRecords from '@salesforce/apex/AccountHelper.createContactRecords';
import getuserDetailsDefault from '@salesforce/apex/AccountHelper.getuserDetailsDefault';
import { getObjectInfo, getPicklistValues } from 'lightning/uiObjectInfoApi';
import LeadSource from "@salesforce/schema/Contact.LeadSource";

import { NavigationMixin } from 'lightning/navigation';

const COLUMNS = [
    { label: 'First Name', fieldName: 'FirstName' },
    { label: 'Last Name', fieldName: 'LastName' },
    { label: 'Email', fieldName: 'Email', type:'Email'},
    { label: 'Phone', fieldName: 'Phone',type: 'phone' },
    { label: 'Title', fieldName: 'Title' },
    {
        label: 'Lead Source',
        sortable: "true",
        fieldName: 'LeadSource',
        type: 'customPicklist',
        editable: true,
        typeAttributes: {
            options: { fieldName: "LeadSourcePIcklist" },
            value: { fieldName: "LeadSource" },
            context: { fieldName: 'Id' }
        }
    },

    { label: 'Release?', 
        fieldName: 'isSelected',
         type: 'toggleButton', 
         initialWidth: 75, 
         hideLabel: true, 
         hideDefaultActions: true, 
         typeAttributes: { 
            rowId: { fieldName: 'Id' } 
        }
    }
   
]
export default class BulkProcessingFeatures extends  NavigationMixin (LightningElement) {

    columns = COLUMNS;

    objectName = CONTACT_OBJECT;
    fields = {
        nameField : NAME_FIELD,
        titleField : TITLE_FIELD,
        phoneField : PHONE_FIELD,
        emailField : EMAIL_FIELD,
        firstName : FIRST_FIELD,
        lastName : LAST_FIELD,
        owner : OWNER_FIELD
    }
   
    @track title = ''
    @track getContactsData = [] 
    @track draftValues = []
    isLoaded = true
    isButtonDisabled = true;
    @track currentUser;
    @track objectId;
    destinationOptions;

    @wire(getuserDetailsDefault,{})
    userDetails;

    handlecellChange(event)
    {
        console.log('event',event);
        event.detail.draftValues.forEach((row) => {
            console.log('row',row);
        })
    }

    handleSearch(event){

        this.isLoaded = false;
        console.log('field');
        const inputfields = this.template.querySelectorAll('lightning-input-field');
        if(inputfields){
            Array.from(inputfields).forEach(field=>{
                console.log('field',field);
                console.log('field.fieldName',field.fieldName,field.value);
                console.log('this.fields.titleField',this.fields.titleField.fieldApiName);
                if (field.fieldName === this.fields.titleField.fieldApiName ) {
                     this.title = field.value;
                }
                     //console.log('title',this.title);
                
            
            })
    
        }
       // console.log('title',this.title);

        this.SearchContacts();
    }
    @wire(getObjectInfo, { objectApiName: CONTACT_OBJECT })
    objectInfo({data, error}) {
        if(data) {
            console.log('data987678',data);
            this.objectId = data.defaultRecordTypeId;
        }else if(error) {
            console.log(error);
        }
    };

    @wire(getPicklistValues,{recordTypeId :'$objectId',fieldApiName:LeadSource })
    picklistValues({data, error}) {
        if(data) {
            this.destinationOptions = data.values;
            console.log('destinationOptions',this.destinationOptions);
        } else if (error) {
            console.log(error);
        }
    }

     SearchContacts(){
     console.log('title',this.title);
        queryContacts({ title: this.title })
        .then(result => {
            console.log('result',result);
            let picklistValue  = this.destinationOptions.map(item=>{         
                return  {  label:item.label , value: item.value };
            })
            let dataRecords = []
            result.forEach(record=>{
                let tempRecord = {...record}
                tempRecord.LeadSourcePIcklist = picklistValue
                console.log('tempRecord123',tempRecord);
                dataRecords.push(tempRecord);
            })
            this.getContactsData = dataRecords;
            console.log('getContactsData',JSON.stringify(this.getContactsData));
            this.isLoaded = true;
        })
        .catch(error => {
            console.log('error',JSON.stringify(error));
            this.isLoaded = true;
        })

    }

    handleRowSelection(event){

        let selectedRows = this.template.querySelector('lightning-datatable').getSelectedRows();
        console.log('selectedRows',selectedRows);
        this.isButtonDisabled = selectedRows.length === 0;
        
    }

    handleCreateContacts(event)
    {
       this.isLoaded = false;
        let selectedRows = this.template.querySelector('lightning-datatable').getSelectedRows();
        console.log('selectedRows',selectedRows);
        const contactIds = selectedRows.map(record=>record.Id)
        createContactRecords({contactIds : contactIds}).then(result=>{
            if(result && result.length > 0)
            {
                console.log('result',result);
                this.showToastMsg('Success', 'Accounts Created', 'success');
                this[NavigationMixin.Navigate]({
                    type: 'standard__recordPage',
                        attributes: {
                            recordId: result[0].Id, 
                            objectApiName: 'Account',
                            actionName: 'view'
                        }
                    });
                this.isLoaded = true;
            }
         else {
            this.showToastMsg('Error', 'No accounts were created', 'error');
            this.isLoaded = true;
        }

        }).catch(error=>{
            console.log('error',error);
            this.showToastMsg('Error',error?.body?.message,'error');
            this.isLoaded = true;
        })
    }

     handleOnLoad(event){
        const inputfields = this.template.querySelectorAll('lightning-input-field');
        if(inputfields){
            Array.from(inputfields).forEach(field=>{
                console.log('field',field);
                console.log('field.fieldName',field.fieldName,field.value);
                if (field.fieldName === this.fields.owner.fieldApiName ) {
                    console.log('currentUser',this.userDetails);
                    if(this.userDetails){
                    field.value = this.userDetails?.data?.Id;
                    console.log('this.userDetails',this.userDetails);
                    }
                }
                     //console.log('title',this.title);
                
            
            })
    
        }
    }

    handleSave(event){
       

}

handleCancel(event){

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