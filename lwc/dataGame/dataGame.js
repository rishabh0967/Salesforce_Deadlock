import { LightningElement,api,track,wire } from 'lwc';
import getAllObjectNames from '@salesforce/apex/AccountHelper.getAllObjectNames';
import getAllFieldForRelatedObects from '@salesforce/apex/DataGameCLass.getAllFieldForRelatedObects';
import importRecords from '@salesforce/apex/DataGameCLass.importRecords'
import LightningAlert from 'lightning/alert';
export default class DataGame extends LightningElement {

   @track filterByCombo = 'Insert';
    filterObjects = "Account"
    @track searchKey = "Account"
    @track getAllObjects = [];
    formatValue = 'Excel'
    filterCsvExcel = 'Paste Excel data here'
    batchInputValue = 1;
    @track excelData = []
    @track headerData = [];
     @track getAllFields = [];
     @track showError = false;
     @track errorMessage = '';
     @track errorClass = '';
     fieldName = '';
     isButtonDisabled = true;
     count = 1;

     @track internalAcc;

     @track selectedField = '';
     @track hoverText = 'Hover to see field options'; 
     @track showFieldOptions = false; 
     @track selectedFields = [];
 

     fieldOptions = [
         { label: 'Id', value: 'Id' },
         { label: 'UpdateAsset__c', value: 'UpdateAsset__c' },
         { label: 'Status', value: 'Status' },
         { label: 'InstallBaseExternalData__c', value: 'InstallBaseExternalData__c' },

     ];
 
     handleMouseOver() {
      console.log('handleMouseOver:');
         this.hoverText = 'Click to select a field';
         this.showFieldOptions = true; 
     }
 
     handleFieldMappingChange(event) {
         this.selectedField = event.target.value; 
         this.hoverText = `Selected field: ${this.selectedField}`; 
         this.showFieldOptions = false; 
     }

     get acc() {
      console.log('HIiiii');
         return this.internalAcc;

     }
 
     set acc(value) {
         if (value !== this.internalAcc) {
             this.internalAcc = value;
             this.handleFieldValue({ target: { value: value } });  
         }
     }

    connectedCallback()
    {
        getAllObjectNames()
        .then(result => {
            console.log('Data: ' + JSON.stringify(result));
            this.getAllObjects = result;
        })
        .catch(error => {
            console.error('Error: ' + error);
        });
        getAllFieldForRelatedObects({objectApiName : 'Account'})
        .then(result=>{
          if(result)
          {
            console.log('fields',result);
            this.getAllFields = result;
          }
    
        }).catch(error=>{
    
          console.log('error',error);
        })
    }

   get options()
   {
      return [
        { label: 'Insert', value: 'Insert' },
        { label: 'Update', value: 'Update' },
        { label: 'Upsert', value: 'Upsert' },
        { label: 'Delete', value: 'Delete' }
      ]
   }
   get getFormatOptions()
    {
       return [
        {label : 'Excel',value: 'Excel'},
        {label : 'CSV', value : 'CSV'},
       ];
    }
   
   get getAllObjectsOptions()
   {
      const result = []
      this.getAllObjects.forEach(item =>{
        let columnDefinition = { 
            label: item.Label,
            value: item.APIName
        };
        result.push(columnDefinition);
      });
   // console.log('result',JSON.stringify(result));
     return result;
   }

   handleChange(event)
   {
     this.filterByCombo = event.target.value;
     console.log('filterByCombo',this.filterByCombo);
   }

   handleObjectsChange(event)
   {
    const objectName = event.target.value;
    this.filterObjects = event.target.value;
    console.log('objectName',objectName);
    getAllFieldForRelatedObects({objectApiName : objectName})
    .then(result=>{
      if(result)
      {
        console.log('fields',result);
        this.getAllFields = result;
        
      }

    }).catch(error=>{

      console.log('error',error);
    })
    
   }
   handleInputChange(event) {
    this.searchKey = event.target.value;
}

handleFormatChange(event)
{
   let result = event.target.value;
   this.filterCsvExcel = result == 'Excel' ? 'Paste Excel data here' : 'Paste CSV data here';
}

handleBatchChange(event)
{
  this.batchInputValue = event.target.value;
}

handlePaste(event) 
{

  event.preventDefault();
  let pastedText = (event.clipboardData || window.Clipboard).getData('text');
  let rows = pastedText.split('\n').filter(row => row.trim() !== ''); 
  if (rows.length < 2) {
      console.error('Insufficient data: Must contain at least header and one data row.');
      return;
  }
  console.log('pastedText:234567', JSON.stringify(pastedText));
  console.log('rows:234567', JSON.stringify(rows));

  let headers = rows[0].split('\t'); 
  this.headerData = headers;
  this.headerData = this.headerData.map(value => value.trim());

  console.log('headers:234567', JSON.stringify(this.headerData));
  let data = [];
  for (let i = 1; i < rows.length; i++) {
      let rowData = rows[i].split('\t'); 
      let record = {};
      headers.forEach((header, index) => {
          record[header.trim()] = rowData[index]?.trim(); 
      });
      data.push(record);
  }
  console.log('Parsed Data:', JSON.stringify(data));
  this.excelData = data;
  console.log('excelData:', JSON.stringify( this.excelData));
}

handleRowSelection(event)
{

    let selectedRows = this.template.querySelector('lightning-datatable').getSelectedRows();
    console.log('selectedRows',selectedRows);
    
}

 handleImportRecords(event)
{  
   let allFields = [];
   this.headerData.forEach(item=>{

      let fieldExist = this.getAllFields.some(field=> field == item);
      if(fieldExist && item != '_Status')
      {
        allFields.push(item);
      }
      else if (item != '_Status'){
        LightningAlert.open({
          message: `Api Name ${item} doest not exist`,
          theme: 'Error',
          label: 'Error',
      });

      }
     
   })
   let selectedRows = this.template.querySelector('lightning-datatable').getSelectedRows();
   //let recordIds = selectedRows.map(item=>item.Id);
   console.log('allFields',JSON.stringify(allFields));
   console.log('selectedRows',JSON.stringify(selectedRows));
   importRecords({ records: this.excelData, batchCount: this.batchInputValue,objectApiName : this.filterObjects, action : this.filterByCombo})
   .then(result=>{
      if(result && result.length > 0)
      {
        let statusCheck = this.headerData.some(item=>item == '_Status');
        if(!statusCheck)
        {
        this.headerData.push('_Status');
        console.log('resultoiui',result);
        }
        for (let i = 0; i < result.length; i++) {  
              this.excelData = this.excelData.map((item, index) => {
                  if (index === i) {  
                    if (item.hasOwnProperty('_Status')) 
                      {
                      item['_Status'] = result[i];  
                     }
                   else 
                   {
                      item['_Status'] = result[i];  
                  }
                  }
                  return item;
              });
          
      }
       
      }
         


   }).catch(error=>{
       
      
   })
}
 
handleRetry(event)
{
   
}



handleFieldValue(event)

{
   const{name,value} = event.target;
   console.log('value',value);
   console.log('name',name);
    
   let index = this.headerData.indexOf(name);   
   console.log('index',index);
   if (index !== -1) {
    
    this.headerData[index] = value;
    this.excelData = this.excelData.map(item => {
      if (item.hasOwnProperty(name)) {    
          item[value] = item[name];
          delete item[name];
      }
      console.log('Updated item', JSON.stringify(item));
      return item;
  });
}
  
  
  console.log('this.headerData',JSON.stringify(this.headerData));
  console.log('this.excelData',JSON.stringify(this.excelData));
   
}


get getColumn()
{
   let columnData = [];
   this.headerData.forEach(item=>{
    let record = { 
      label: item,
       fieldName: item
      };
  columnData.push(record);

   })
   return columnData;
}

handleSuccessfailData(event)
{
  const { name, checked } = event.target;
  
  console.log('name',name,checked);
  if(name == 'Success')
  {
    if(checked)
    {
      
      let data = this.excelData.filter(item=>{
        if (item.hasOwnProperty('_Status')) 
          {
          return item._Status =='Success'
          }
      })
      this.excelData = data;
    }
    if(!checked)
    {
      let data = this.excelData.filter(item=> item._Status !='Success')
      this.excelData = data;
    }

  }

  if(name == 'Failed')
    {
      if(checked)
        {
          let data = this.excelData.filter(item=> item._Status !='Success')
          this.excelData = data;
        }
        if(!checked)
        {
          let data = this.excelData.filter(item=> item._Status =='Success')
          this.excelData = data;
        }
       
    }
  
}

}