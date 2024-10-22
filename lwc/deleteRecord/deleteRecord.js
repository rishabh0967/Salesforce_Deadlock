import { LightningElement,api,track,wire } from 'lwc';
import { CurrentPageReference } from 'lightning/navigation';
import { NavigationMixin } from 'lightning/navigation';
import queryRecordsToDelete from '@salesforce/apex/AccountHelper.queryRecordsToDelete';
import DeleteSobjectRecords from '@salesforce/apex/AccountHelper.DeleteSobjectRecords';	
import getCreateRelatdSettings from '@salesforce/apex/AccountHelper.getCreateRelatedSettings';	
import startBatchDelete from '@salesforce/apex/AccountHelper.startBatchDelete';	
import getBatchJobStatus from '@salesforce/apex/AccountHelper.getBatchJobStatus';	
import filterQueryData from '@salesforce/apex/AccountHelper.filterQueryData';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import {refreshApex} from '@salesforce/apex';
import { RefreshEvent } from 'lightning/refresh';
import LightningAlert from 'lightning/alert';
import {loadStyle} from 'lightning/platformResourceLoader'
import COLORS from '@salesforce/resourceUrl/colors'
export default class DeleteRecord  extends NavigationMixin(LightningElement) {

    @api listViewIds;

    @track recordsData = [];  
    @track WireData = []; 
    @track  getAllData = [];
    @track error; 
    @track wireRefreshdata;
    isLoaded = true
    isButtonDisabled = true;
    timer;
    queryTimer
    filterByCombo = 'All'
    query = '';
    // columns = [
    //     { label: 'ID', fieldName: 'Id' },
    //     { label: 'Name', fieldName: 'Name' },
    //     {label: 'Created Date', fieldName: 'CreatedDate',type: 'date',
    //         typeAttributes:{day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:true}}
    // ];  

   @track allChildObjectColumns = [];
   @track columns = [];



    @wire(queryRecordsToDelete, { recordId: '$listViewIds'})
    wiredContacts(value) {
        this.wireRefreshdata = value;
        const {data,error} = value  
        if (data) {
            this.recordsData = data;
            this.error = undefined; 
            console.log('Contacts Data:', JSON.stringify(this.recordsData));

            if (this.recordsData && this.recordsData.length > 0) {
                 let record = this.recordsData[0]; 
                Object.keys(record).forEach(key => {
                    let c = key.replace(/__c/g, '') .replace(/__/g, ' ');    
                    c = c.replace(/\b\w/g, letter => letter.toUpperCase());
                    if (c.includes(' ')) {
                        let splitParts = c.split(' ');
                        c = splitParts[splitParts.length - 1];
                    }
                
                    let columnDefinition = { 
                        label: c,
                        fieldName: key 
                    };
                    if (key === 'CreatedDate') {
                        columnDefinition.type = 'date';
                        columnDefinition.typeAttributes = {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                            hour12: true
                        };
                    }                  
                    this.columns.push(columnDefinition);
                });

                this.allChildObjectColumns = this.columns;

                console.log('allChildObjectColumns',JSON.stringify(this.allChildObjectColumns));

            }
            else if(this.recordsData.length == 0)
            {
                LightningAlert.open({
                    message: 'No Record Found',
                    theme: 'Warning', 
                    label: 'Warning!',
                });
            }
            
            this.WireData = data;
            this.getAllData = data;
           
        } else if (error) {
            this.error = error;
            console.log('error',error);
            this.recordsData = undefined; 
        }

}

applyHeaderStyle() {
    const datatable = this.template.querySelector('lightning-datatable');
    if (datatable) {
        const style = document.createElement('style');
            style.innerText = `:host { background-color: yellow !important;}`;
        datatable.shadowRoot.appendChild(style);
    }
}

handleRowSelection(event)
{

    let selectedRows = this.template.querySelector('lightning-datatable').getSelectedRows();
    console.log('selectedRows',selectedRows);
    this.isButtonDisabled = selectedRows.length === 0;
    
}

renderedCallback(){ 
    if(this.isCssLoaded) return
    this.isCssLoaded = true
    loadStyle(this, COLORS).then(()=>{
        console.log("Loaded Successfully")
    }).catch(error=>{ 
        console.error("Error in loading the colors")
    })
}

async handleDeleteRecords(event)
{
    try {
        this.isLoaded = false;
        let selectedRows = this.template.querySelector('lightning-datatable').getSelectedRows();
        console.log('selectedRows',selectedRows);
        const recordIds = selectedRows.map(record=>record.Id)
        const asyncCount = await getCreateRelatedSettings({recordIds : recordIds,selectedRecordSize : selectedRows.length})
    

        if (selectedRows && selectedRows.length > asyncCount) {
            let batchJobId = await startBatchDelete({recordIds : recordIds});

            if (batchJobId) {
                await LightningAlert.open({
                    message: 'Records are being deleted in the background asynchronously.',
                    theme: 'success',
                    label: 'Batch Process Initiated',
                });

                this.pollBatchStatus(batchJobId); // Start polling for batch completion
            }
        }

        else {

        let result = await DeleteSobjectRecords({recordIds : recordIds});
        if(result && result > 0) {
            console.log('result', result);
           // this.showToastMsg('Success', 'Deleted Successfully', 'success');
           const successMessage = `${result} has been Deleted Successfully !`
           await LightningAlert.open({
            message: `${result} Recors has been deleted Successfully !`,
            theme: 'success', 
            label: 'success!',
        });

            this.isLoaded = true;
            refreshApex(this.wireRefreshdata);
        }
    }
    } catch(error) {
        console.log('error', JSON.stringify(error));
       // const errorMessage = error?.body?.pageErrors?.message;
        const errorMessage = error?.body?.pageErrors[0]?.message;
        console.log('errorMessage',errorMessage);
        await LightningAlert.open({
            message: errorMessage,
            theme: 'error', 
            label: 'Error!',
        });

        console.error('Error:', error);
    }
}


pollBatchStatus(batchJobId) {

    const POLLING_INTERVAL = 2000; 
    let pollTimer = window.setInterval(async () => {
        let batchStatus = await getBatchJobStatus({ jobId: batchJobId });
        console.log('batchStatus',batchStatus);
        if (batchStatus === 'Completed') {
            window.clearInterval(pollTimer);

            await LightningAlert.open({
                message: 'Batch process completed successfully',
                theme: 'success',
                label: 'Success',
            });
            refreshApex(this.wireRefreshdata);
        } else if (batchStatus === 'Failed') {
            window.clearInterval(pollTimer);
           await LightningAlert.open({
            message: 'Batch process failed',
            theme: 'Error',
            label: 'error',
        });

        }
    }, POLLING_INTERVAL);
}

async handleSearch(event)
{
  const data = event.target.value;


}

get options (){
    let allOptions = []
    allOptions.push( { label: 'All', value: 'All' });
    let option = this.allChildObjectColumns.map(item=>{
        let c = item.fieldName.replace(/__c/g, '') .replace(/__/g, ' ');    
    c = c.replace(/\b\w/g, letter => letter.toUpperCase());
    if (c.includes(' ')) {
        let splitParts = c.split(' ');
        c = splitParts[splitParts.length - 1];
    }

    let columnDefinition = { 
        label: c,
        value: item.fieldName
    };
    return columnDefinition;
    });
    allOptions = [...allOptions, ...option];
    console.log('option',JSON.stringify(allOptions));
    return allOptions;


  }

  filterByQuery(event)
  {
 
    this.query = event.target.value;
    console.log('query',this.query);
    window.clearTimeout(this.queryTimer);
    if(this.query === null || this.query==='')
    {
        this.queryTimer = window.setTimeout(()=>{
        this.WireData = [...this.getAllData];
        },500)
    }

    }

    handleSearch(event)
    {
      console.log('query',this.query);
     if(this.query && this.query != '' && this.query != null)
     {
    filterQueryData({ recordId: this.listViewIds,filterQueryRecords:this.query})
    .then(data=>{   

        if (data) {
            this.recordsData = data;
            this.error = undefined; 
            console.log('recordsData', JSON.stringify(this.recordsData))
                
                this.WireData = data;
                LightningAlert.open({
                    message: 'SuccessFully Found Records',
                    theme: 'Success', 
                    label: 'Success!',
                });
            }
            else if(this.data.length == 0)
            {
                LightningAlert.open({
                    message: 'No Record Found',
                    theme: 'Warning', 
                    label: 'Warning!',
                });
            }

    })
    .catch(error=>{
        
        console.log('error',error);
        this.recordsData = undefined; 
            LightningAlert.open({
                message: error?.body?.message,
                theme: 'Error', 
                label: 'Error!',
            });

    })
}
    
    
    }
    

  

  handleChange(event)
  {
    console.log('event.target.value',event.target.value);
    this.filterByCombo = event.target.value;
  }

handleFilter(event)
{
     const value = event.target.value;
     window.clearTimeout(this.timer);
     if (value) {
      this.timer = window.setTimeout(()=>{
          console.log('filterBy', value);
         
      this.WireData = this.recordsData.filter(item => { 
        
        if(this.filterByCombo === 'All')
            {
          return Object.keys(item).some(key => {                                                                                     
              const itemValue = item[key];
              console.log('item',item);
              console.log('value',value);
             return  itemValue.includes(value)
      
          });
        }
        else{
            const itemValue = item[this.filterByCombo]? item[this.filterByCombo]:'';
            return  itemValue.includes(value);
    
        }
    
      });
    

  },500)
  } else {
      this.WireData = [...this.recordsData];
  }
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

showToast() {
    const event = new ShowToastEvent({
        title: 'Toast message',
        message: 'Toast Message',
        variant: 'success',
        mode: 'dismissable'
    });
    this.dispatchEvent(event);
}



}