import { LightningElement, track, wire,api } from 'lwc';
import queryRelatedOpportunitys from '@salesforce/apex/AccountHelper.queryRelatedOpportunitys';
import updateContacts from '@salesforce/apex/AccountHelper.updateContacts';
import { notifyRecordUpdateAvailable } from "lightning/uiRecordApi";
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from "@salesforce/apex";
import { updateRecord } from "lightning/uiRecordApi";


const COLUMNS = [
    { label: 'Name', fieldName: 'Name' },
    { label: 'Vehicle Type', fieldName: 'VehicleType__c' },
    { label: 'Issue Reported', fieldName: 'IssueReported__c'},
    { label: 'Amount', fieldName: 'Amount', editable: true },
]
export default class ViewPanel extends LightningElement {

@api recordId;
@track oppoData = [];
@track allOppData = [];
@track allCheckedOppData = [];
columns = COLUMNS;
filterBy = '';
checkedValue;
isButtonDisabled = true;
@track wireRefreshdata;
draftValues = [];

    @wire(queryRelatedOpportunitys,{recordId:'$recordId'})
    WireData(value)
    {
        this.wireRefreshdata = value;
        const{data,error} = value
        if(data)
        {
           this.oppoData = data;
           this.allOppData = data;
           this.allCheckedOppData = data;
           console.log('data',data);
        }
        if(error)
        {

        }
    }
     
    accountOptionId='existing'
    accountOptions = [

        { label: 'New Account', value: 'new' },
        { label: 'Existing Account', value: 'existing' }
    ];

    handleAccountOptionChange(event)
    {
      console.log('Hii');
 
     }
handleOutOfStockChange(event)
 {
    const { name, checked } = event.target;
    if(checked)
    {
         this.oppoData = this.allCheckedOppData.filter(item=>item.Amount == 0)
         console.log('oppoData',JSON.stringify(this.oppoData));
         this.checkedValue = true;
         this.allOppData = this.oppoData;
    }
    else{
         this.oppoData = this.allCheckedOppData;
         this.allOppData = this.allCheckedOppData;

    }
}

handleFilter(event)
{

   const value = event.target.value;
   console.log('value',value);
   if(value)
   {
   this.oppoData = this.allOppData.filter(item=>{
    console.log('item',item);
         const someData = Object.keys(item).some(key => { 
            if(key != 'Amount' && key != 'IssueReported__c')
            {
          const itemValue = item[key];
         console.log('itemValue',itemValue);
         console.log('includes',itemValue.includes(value));
         return  itemValue.includes(value);
            }
   })
   console.log('someData',someData);
   return someData;
  
   });
   //this.oppoData = filterData;
   console.log('filterData',this.oppoData);
}
  else{
   this.oppoData =  [...this.allOppData];
   console.log('oppoData',this.oppoData);
  }
}

handleRowSelection(event)
{
    let selectedRow = this.template.querySelector('lightning-datatable').getSelectedRows();
    this.isButtonDisabled = selectedRow.length == 0;

}

handleSaveData(event){

  let selectedRows = this.template.querySelector('lightning-datatable').getSelectedRows();
}

handleCancelData(event)
{
  
}

async handleSave(event) {
    // Convert datatable draft values into record objects
    const records = event.detail.draftValues.slice().map((draftValue) => {
      const fields = Object.assign({}, draftValue);
      return { fields };
    });

    // Clear all datatable draft values
    this.draftValues = [];
    console.log('records',JSON.stringify(records));

    try {
      // Update all records in parallel thanks to the UI API
      const recordUpdatePromises = records.map((record) => updateRecord(record));
      await Promise.all(recordUpdatePromises);
      console.log('recordUpdatePromises',recordUpdatePromises);
      // Report success with a toast
      this.dispatchEvent(
        new ShowToastEvent({
          title: "Success",
          message: "Contacts updated",
          variant: "success"
        })
      );

      // Display fresh data in the datatable
      await refreshApex(this.wireRefreshdata);
    } catch (error) {
      this.dispatchEvent(
        new ShowToastEvent({
          title: "Error updating or reloading contacts",
          message: error.body.message,
          variant: "error"
        })
      );
    }
  }
 
 handleCancel(event){
 
 }



}