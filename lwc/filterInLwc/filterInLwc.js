import { LightningElement,track,wire } from 'lwc';
import queryFilterContact from '@salesforce/apex/AccountHelper.queryFilterContact';
 
export default class FilterInLwc extends LightningElement {

@track getFilterContactData = [];
@track getFullContactData = [];
filterBy='';
filterByCombo = 'FirstName';
timer;

    @wire(queryFilterContact)
    WireData({data,error})
    {
        if(data){
            console.log('data',data);
            this.getFilterContactData = data;
            this.getFullContactData = data;
        }
        if(error){
            console.log('error',error);
        }
    }

    get columns(){

        return [

                { label: 'First Name', fieldName: 'FirstName' },
                { label: 'Last Name', fieldName: 'LastName' },
                { label: 'Email', fieldName: 'Email', type:'Email'},
                { label: 'Phone', fieldName: 'Phone',type: 'phone' },
                { label: 'Title', fieldName: 'Title' },
            
        ]
  }
  get options (){
    return [
        
        { label: 'All', value: 'All' },
        { label: 'First Name', value: 'FirstName' },
        { label: 'Last Name', value: 'LastName' },
        { label: 'Email', value: 'Email'},
        { label: 'Phone', value: 'Phone' },
        { label: 'Title', value: 'Title' }    
    
      ]
  }

  handleChange(event)
  {
    console.log('event.target.value',event.target.value);
    this.filterByCombo = event.target.value;
  }

  handleFilter(event)
  {
       const value = event.target.value;
       window.clearTimeout( this.timer);
       if (value) {
        this.timer = window.setTimeout(()=>{
            console.log('filterBy', value);
           
        this.getFilterContactData = this.getFullContactData.filter(item => { // filter will retur new array when condition of item satisfy 
            if(this.filterByCombo === 'All')
                {
            return Object.keys(item).some(key => { // it any of return true then it will return it will return false only in case when all 
                                                      //array return  false
                                                      //every return true when all return true
                const itemValue = item[key];
                // Ensure the itemValue is a string before calling toLowerCase
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
        this.getFilterContactData = [...this.getFullContactData];
    }
}

}