import { LightningElement,api,wire } from 'lwc';
import queryAccounts from '@salesforce/apex/AccountHelper.queryAccounts'
import Street from '@salesforce/schema/Asset.Street';
import City from '@salesforce/schema/Asset.City';
import PostalCode from '@salesforce/schema/Asset.PostalCode';
import State from '@salesforce/schema/Asset.State';
import Country from '@salesforce/schema/Asset.Country';
import Description from '@salesforce/schema/Account.Description';
export default class MapInLwc extends LightningElement {
mapMarkers = []
accountLocation = 'Acount Location';
selectedMarker;
    @wire(queryAccounts)
    WireData({data,error})
    {
        if(data){
            console.log('data',data);
          this.formatResponse(data);
        }
        if(error){
            console.log('error',error);
        }
    }
    formatResponse(data)
    {
       this.mapMarkers = data.map(item=>{
            return {
                location:{
                    Street:item.BillingCity || '',
                    City : item.BillingCity || '',
                    PostalCode : item.BillingPostalCode || '',
                    State : item.BillingCity || '',
                    Country : item.BillingCountry || '',
                },
                icon :'utility:salesforce',
                title : item.Name,
                value :item.Name,
                description: item.description
            }
        })
        console.log('this.mapMarkers',JSON.stringify(this.mapMarkers));
        this.selectedMarker = this.mapMarkers.length  && this.mapMarkers[0].value
    }
    handleMarkerSelect(event)
    {
        this.selectedMarker = event.detail.selectedMarkerValue;
    }

}