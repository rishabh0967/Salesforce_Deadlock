import { LightningElement,api,track,wire } from 'lwc';
import queryOpportunitys from '@salesforce/apex/AccountHelper.queryOpportunitys';
import updateOpportunity from '@salesforce/apex/AccountHelper.updateOpportunity';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { NavigationMixin } from 'lightning/navigation';
import { getRecordNotifyChange } from 'lightning/uiRecordApi';
import { refreshApex } from '@salesforce/apex';
import { CloseActionScreenEvent } from 'lightning/actions'; 
import TWOwHEELERSPIC from '@salesforce/resourceUrl/twoWheelers';
import THREEWHEELERS from '@salesforce/resourceUrl/ThreeWheelers';
import FOURWHEELERS from '@salesforce/resourceUrl/FourWheelers'
export default class InputManualSelection extends LightningElement {
   
     @ track getAllData;
     @track  twoWheelersData;
   @track threeWheelersData;
   @track fourWHeeleresData;
    @track SelectedData = [];
    @track wireRefreshdata;
    isLoaded = false
    activeTabValue='TwoWheeler';
    TWOwHEELERSPIC = TWOwHEELERSPIC;
    threewHEELERSPIC = THREEWHEELERS;
    fourwHEELERSPIC = FOURWHEELERS;
    @wire(queryOpportunitys,{})
    WireData(value)
    {
        this.wireRefreshdata = value;
        const{data,error} = value
        if(data)
        { 
            console.log('data',data);
            this.getAllData = data;
             this.twoWheelersData = this.getAllData.filter(item=>{
                return item.VehicleType__c === 'Two Wheeler';
             })
             console.log('twoWheelersData',JSON.stringify(this.twoWheelersData));

             this.threeWheelersData = this.getAllData.filter(item=>{
                return item.VehicleType__c === 'Three Wheeler';
             })

             this.fourWHeeleresData = this.getAllData.filter(item=>{
                return item.VehicleType__c === 'Four Wheeler';
             })

        }
        this.isLoaded = true;
    }
    get isButtonDisabled()
    {
       return this.SelectedData.length === 0
    }

handleVehicleChange(event){
    const { name, checked } = event.target;
    console.log('event.target',name,checked);
    let existingData =  this.SelectedData.find(item=>item.Id === name)
     if(existingData){
       if(checked)
        return;

      else{     
        this.SelectedData = this.SelectedData.filter(item => item.Id !== name);
      }

     }
       
   if(checked)
   {
    let data = this.getAllData.find(item=> item.Id === name)
    if (data) {
    this.SelectedData.push(data);
}
   }
console.log('Selected Data:', JSON.stringify(this.SelectedData));
}

handleSave(event)
{
    console.log('Save:', JSON.stringify(this.SelectedData));
    updateOpportunity({data:this.SelectedData})
    .then(result=>{
        if(result){
            console.log('result',result);
            this.showToastMsg('Success','Opportunity Updated', 'success');
            // getRecordNotifyChange([{ recordId: this.recordId }]);
            // eval("$A.get('e.force:refreshView').fire();");
            this.SelectedData = [];
            refreshApex(this.wireRefreshdata);
           
        
        }

        else{
            this.showToastMsg('Error','Please Select Data to Update!!', 'error');
        }



    }).catch(error=>{
        console.log('error',error);
        this.showToastMsg('Error',error?.body?.message,'error');

    })  
   
}

handleCancel(event)
{
    const checkboxes = this.template.querySelectorAll('lightning-input');
    console.log('checkboxes',checkboxes);

    checkboxes.forEach(checkbox => {
        checkbox.checked = false;
    });
    this.findData = [];
    refreshApex(this.wireRefreshdata);
}

handleClose(){
    this.dispatchEvent(new CloseActionScreenEvent());
   }

   handleActive(event)
   {
    console.log('Hii');
    this.activeTabValue = event.target.value;
    console.log(' this.activeTabValue', this.activeTabValue);
   }

   
   

   get getTwoWheelrs()
   {
    console.log('activeTabValue',this.activeTabValue);
       return this.activeTabValue ==='TwoWheeler';
   }
   get getThreeWheelrs()
   {
    console.log('activeTabValue',this.activeTabValue);
       return this.activeTabValue ==='ThreeWheeler';
   }

   get getFourWheelrs()
   {
    console.log('activeTabValue',this.activeTabValue);
       return this.activeTabValue ==='FourWheeler';
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