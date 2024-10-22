import { api, track, wire } from 'lwc';
import { LightningElement } from 'lwc';
import queryAccounts from '@salesforce/apex/AccountHelper.queryAccounts';
import { updateRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

const columns = [
    { label: 'Name', fieldName: 'Name', editable: true },
    { label: 'Website', fieldName: 'Website', type: 'url', editable: true },
    { label: 'Phone', fieldName: 'Phone', type: 'phone', editable: true }
];

export default class DataTableInLwc extends LightningElement {
    columns = columns;
    data;
    error;
    @track draftValues = [];
   

    @wire(queryAccounts)
    wiredAccounts({ data, error }) {
        if (data) {
            this.data = data;
            this.error = undefined; // Clear previous errors if data is successfully received
        } else if (error) {
            this.error = error;
            this.data = undefined; // Clear previous data if there is an error
        }
        // Find in js
        let arr = [1,2,3,4,5,6];
        let val2 = arr.find(item => item > 3);        
        console.log('find',val2); // It will return 4 it will return first value when condition Satisfy;
        
        // map in js

        let map1 = arr.map(item=>item+2)
        console.log('map1',JSON.stringify(map1)); // it will return new copy of array with whatver operation

        // some in js

        let some1 = arr.some(item=>item>5)
        console.log('some1',some1); // it return true when any time condition satisfy

        let every1 = arr.every(item=>item>5) // it willl return true value when all condition satisfy
        console.log('every1',every1);

    // for each in js
    arr.forEach((item) => {
        console.log(item);
      });

      const arr12 = [{"deliveryName":"DN24060836","branchId":"a1p2s0000022THCAA2","branchName":"Cummins Sales Service Private Limited- Noida","itemId":"a312s0000014DRCAA2","itemName":"3238401","dmpl__Quantity__c":2},{"deliveryName":"DN24081191","branchId":"a1p2s0000022THCAA2","branchName":"Cummins Sales Service Private Limited- Noida","itemId":"a310T000000DbtCQAS","itemName":"3076132","dmpl__Quantity__c":38}];

const st = new Set();
arr12.forEach(item=>{
    st.add(item.dmpl__Quantity__c);
});
console.log(st);
arr12.forEach(item=>{
    st.add(item);
});
console.log(st);

const arr1 = Array.from(st);
console.log(arr1);

console.log(Array.from(st).join(','));


    }

    handleSave(event) {
        const updatedFields = event.detail.draftValues;
        console.log('updatedFields', updatedFields);

        const recordInputs = updatedFields.slice().map(draft => {
            const fields = Object.assign({}, draft);
            return { fields };
        });

        console.log('recordInputs', recordInputs);

       const promises = recordInputs.map(recordInput => updateRecord(recordInput));
       console.log('promises', promises);
        //const results = await Promise.all(promises);
        //console.log('results', results);
        /*Promise.all(promises).then(result => {
            //this.showToastMsg('Success', 'Accounts Updated', 'success');
            console.log('result', result);
            this.draftValues = []; // Clear draft values after successful save
            return refreshApex(this.data); // Refresh the data after saving
        })
        .catch(error => {
           // this.showToastMsg('Error', error.body.message, 'error');
            console.log('error', error);
        });*/
    }

    handleCancel(event) {
        this.draftValues = []; // Clear draft values when canceling edits
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
    value = '';

    get options() {
        return [
            { label: 'Apple', value: 'apple' },
            { label: 'Blueberry', value: 'blueberry' },
            { label: 'Cherry', value: 'cherry' },
            { label: 'Pumpkin', value: 'pumpkin' },
        ];
    }

    handleChange(event) {
        this.value = event.detail.value;
    }

    get inputVariables() {
        return [
            {
                name: 'OpportunityID',
                type: 'String',
                value: '<Opportunity.Id>'
            },
            {
                name: 'AccountID',
                type: 'String',
                value: '<Opportunity.AccountId>'
            }
        ];
    }
    
    handleStatusChange(event) {
        if (event.detail.status === 'FINISHED') {
            // set behavior after a finished flow interview
        }
    }







}