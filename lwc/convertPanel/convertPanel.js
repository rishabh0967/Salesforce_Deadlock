import { LightningElement,api,wire } from 'lwc';
import { getRecord,getFieldValue } from 'lightning/uiRecordApi';
import NAME_FIELD from '@salesforce/schema/Account.Name';   
import USER_FIELD from '@salesforce/schema/Account.UserId__c';
import PHONE_FIELD from '@salesforce/schema/Account.Phone';
import OWNER_NAME_FIELD from '@salesforce/schema/Account.Owner.Name';
import ANNAUAL_REVENUE_FIELD from '@salesforce/schema/Account.AnnualRevenue';
import ACCOUNT_TYPE_FIELD from '@salesforce/schema/Account.Type';
import ACCOUNT_EMPLOYEES_FIELD from '@salesforce/schema/Account.NumberOfEmployees';
import CUSTOMERPRIORITY_FIELD from '@salesforce/schema/Account.CustomerPriority__c'
import BILLINGADDRESS_FIELD from '@salesforce/schema/Account.BillingAddress'
import SHIPPINGADDRESS_FIELD from '@salesforce/schema/Account.ShippingAddress'
import CONTACT_NAME from '@salesforce/schema/Asset.Status'
import Account_OBJECT from '@salesforce/schema/Account'
import { getObjectInfo } from 'lightning/uiObjectInfoApi';
import createContact from '@salesforce/apex/AccountHelper.createContact';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { NavigationMixin } from 'lightning/navigation';
import { getRecordNotifyChange } from 'lightning/uiRecordApi';
import { refreshApex } from '@salesforce/apex';
import { CloseActionScreenEvent } from 'lightning/actions'; 
export default class ConvertPanel extends LightningElement {
  
    @api recordId;
    @api objectApiName;
    @api targetObjectApiName;
   name = NAME_FIELD;
   contactName = CONTACT_NAME;
   accountOptionId = 'existing'
   ConatctOptionId = 'existing'
   AccountData;
   user= USER_FIELD ;
   phone = PHONE_FIELD;
   annualRevenue = ANNAUAL_REVENUE_FIELD;
   customerPriority = CUSTOMERPRIORITY_FIELD;
   type = ACCOUNT_TYPE_FIELD;
   numberOFEmployee = ACCOUNT_EMPLOYEES_FIELD;
   billingAddress = BILLINGADDRESS_FIELD;
   shippingAddress = SHIPPINGADDRESS_FIELD;
   isButtonDisabled = false;
   AccountFields={}
   wiredata;
   isLoaded = false
   ISNewAccount = false;
   existingName;
   accountOptions = [

    { label: 'New Account', value: 'new' },
    { label: 'Existing Account', value: 'existing' }
];

ConatactOption = [
    {label:"New User",value : 'new'},
    { label: 'Existing User', value: 'existing' }
]

renderedCallback()
{
    if (this.objectApiName)
    console.log('objectApiName',this.objectApiName);
    if (this.recordId) 
    console.log('recordId',this.recordId);
    
}

   @wire(getRecord,{recordId:'$recordId',fields:[NAME_FIELD,USER_FIELD,PHONE_FIELD,
                    OWNER_NAME_FIELD,ANNAUAL_REVENUE_FIELD,ACCOUNT_TYPE_FIELD,ACCOUNT_EMPLOYEES_FIELD]})
   wiredRecord({error,data}) {
    if(data)
    {
        this.existingName = getFieldValue(data, NAME_FIELD);
         
        console.log('this.existingName',this.existingName);
        this.wiredata = data;
        console.log('data',data);
        console.log('name',this.name);
        this.AccountData = data;
        console.log(this.contactName);
        this.isLoaded = true;
        //user = data.fields.UserId__c;
        // if (this.objectApiName)
        //     console.log('objectApiName',this.objectApiName);
        //     if (this.recordId) 
        //     console.log('recordId',this.recordId);
          
    }

   }

   handleAccountOptionChange(event)
   {
     this.accountOptionId = event.detail.value;
     if(this.accountOptionId == 'new')
     {
         this.ISNewAccount = true;
   }
   if(this.accountOptionId == 'existing'){
    this.ISNewAccount = false;
   }

}
   handleContactOptionChange(event){
      this.ConatctOptionId = event.detail.value;
      console.log('ConatctOptionId',this.ConatctOptionId);
   }

   handleSave(event){
    let inputfields = this.template.querySelectorAll('lightning-input-field');
    let fields = { 'Id' : this.recordId };
    Array.from(inputfields).forEach(field=>{
        console.log('field.fieldName',field.fieldName,field.value);
        fields[field.fieldName] = field.value;
    })

        createContact({data: fields}).then(result=>{
            if(result){
                console.log('result',result);
                this.showToastMsg('Success','Contact Created', 'success');
                // getRecordNotifyChange([{ recordId: this.recordId }]);
                // eval("$A.get('e.force:refreshView').fire();");
                refreshApex(this.wiredata);
                this.handleClose()
            
            
            }
            else{
                this.showToastMsg('Error','Error Occured', 'error');

            }

        }).catch(error=>{
            console.log('error',error);
            this.showToastMsg('Error',error?.body?.message,'error');

        })  
  
}


   
handleCancel(event){
    this.handleClose()

   }

   handleClose(){
    this.dispatchEvent(new CloseActionScreenEvent());
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