import { LightningElement, track ,wire} from 'lwc';
import { registerListener, unregisterAllListeners, fireEvent } from 'c/pubsub';
import { CurrentPageReference } from 'lightning/navigation';
import {createGarment, raiseToastEvent} from 'c/util';

import GARMENT_OBJECT from '@salesforce/schema/Garment__c';
import NAME_FIELD from '@salesforce/schema/Garment__c.name';
import COLOR_FIELD from '@salesforce/schema/Garment__c.color__c';
import TYPE_FIELD from '@salesforce/schema/Garment__c.type__c';
import PRICE_FIELD from '@salesforce/schema/Garment__c.price__c';
import URL_FIELD from '@salesforce/schema/Garment__c.url__c';
import EXTID_FIELD from '@salesforce/schema/Garment__c.extId__c';

import insertCheck from '@salesforce/apex/checkGarments.insertCheck';
import deleteGarment from '@salesforce/apex/checkGarments.deleteGarment';
import getGarmentId from '@salesforce/apex/checkGarments.getGarmentId';

const actions = [
    { label: 'Add to salesforce', name: 'add' },
    { label: 'Delete from salesforce', name: 'delete' },
];

const columns = [
{ label: 'Name', fieldName: 'name' },
{ label: 'price', fieldName: 'price', type: 'currency' },
{ label: 'Color', fieldName: 'color', type: 'text' },
{ label: 'Type', fieldName: 'type', type: 'text' },
{type: "button", typeAttributes: {  
    label: 'View Image',  
    name: 'View',  
    title: 'View Image',  
    disabled: false,  
    value: 'view',  
    iconPosition: 'left'  
}},
{
    type: 'action',
    typeAttributes: { rowActions: actions },
},


];

export default class PythonIntComp extends LightningElement {
val=500;
selectionValue='none';
sliderValue=500;
columns = columns;

@track selectedUrl;
@wire(CurrentPageReference) pageRef;

@track shopData=undefined;
@track filteredResultsData=undefined;

showSpinner =false;

get options() {
return [
{label:'None', value:'none'},
{ label: 'Shirts', value: 'shirts' },
{ label: 'T Shirts', value: 'T_Shirts'},
{ label: 'Jeans', value: 'jeans' },
];
}

handleSelectionChange(event){
this.selectionValue = event.target.value;
}


handleSliderChange(event){
this.sliderValue = event.target.value;
}

getDetails(event){

console.log('buttonClicked');
this.showSpinner =true;
// POST request using fetch() 
fetch("https://nitishshr481.pythonanywhere.com/events", { 

// Adding method type 
method: "POST", 

// Adding body or contents to send 
body: JSON.stringify({ 
"clothType": this.selectionValue, 
"sliderValue": this.sliderValue

}), 

// Adding headers to the request 
headers: { 
"Content-type": "application/json; charset=UTF-8"
} 
}) 

// Converting to JSON 
.then(response => response.json()) 

// Displaying results to console 
.then(json => {
        this.showSpinner =false;
        this.filteredResultsData = json;
        this.shopData = undefined;
            }); 
}

getAll(event){
this.showSpinner =true;
fetch("https://nitishshr481.pythonanywhere.com/")
.then(response => response.json())
.then(res => {
    this.showSpinner = false;
    this.shopData =  [{"data":res.jeans,label : "Jeans"},
    {"data":res.shirts, label:"Shirts"},
    {"data":res.T_Shirts,label:"T-Shirts"}]
    this.filteredResultsData = undefined;
});
}

callRowAction( event ) {  
          
    const rec =  event.detail.row;  
    const actionName = event.detail.action.name;  
    switch(actionName) { 
        case 'View': 
            getGarmentId({extId:rec.extId})
            .then((res) => {
                this.garmentId = res;
                this.selectedUrl = event.detail.row.url;
                this.selectedjson = {...rec, selectedUrl :this.selectedUrl, garmentId:this.garmentId};
                fireEvent(this.pageRef, 'selectedUrl', JSON.stringify(this.selectedjson));
                
            })
            .catch((err) =>{
                console.log('getGarmentId error' + err);
            })
            break;
        case 'add':
            this.addToSalesforce(rec);
            break;
        case 'delete':
            this.deleteFromSalesforce(rec);
            break;
        default:
            console.log('default action');
        
    }         

}  

addToSalesforce =(rec) => {
    this.fields={};
    for(let i in rec){
        console.log(i);
        if(i=="name") this.fields["Name"] = rec[i];
        else if(i=="type") this.fields[TYPE_FIELD.fieldApiName] = rec[i];
        else if(i=="color") this.fields[COLOR_FIELD.fieldApiName] = rec[i];
        else if(i=="price") this.fields[PRICE_FIELD.fieldApiName] = rec[i];
        else if(i=="url") this.fields[URL_FIELD.fieldApiName] = rec[i];
        else if(i=="extId") this.fields[EXTID_FIELD.fieldApiName] =rec[i];
    }
    console.log(this.fields);
    insertCheck({extId:rec.extId,garment:this.fields})
    .then((result) => {
        this.message = result;
        console.log(result);
        this.error = undefined;
    })
    .then(()=>{
        if(!this.message) {
            createGarment(this.fields,GARMENT_OBJECT.objectApiName,(garmentId) => {
                this.garmentId = garmentId;
                this.selectedUrl = rec.url;
                this.selectedjson = {...rec, selectedUrl :this.selectedUrl,garmentId:this.garmentId};
                fireEvent(this.pageRef, 'selectedUrl', JSON.stringify(this.selectedjson));

            });
            
        }

        else raiseToastEvent('success',`${rec.name} is updated and synced`,'success');
    })
    .catch((error) => {
        this.message = undefined;
        this.error = error;
        console.log('save error'+error);
    });

    
    
   }

deleteFromSalesforce = (rec) => {
    deleteGarment({extId : rec.extId})
    .then((result) => {
        if (result) {
            this.selectedUrl = rec.url;
            this.selectedjson = {...rec,selectedUrl :this.selectedUrl,garmentId:'Not Exist'};
            fireEvent(this.pageRef, 'selectedUrl', JSON.stringify(this.selectedjson));
            raiseToastEvent(`${rec.name} is deleted`);
        }
        else raiseToastEvent('error',`${rec.name} is not yet added to salesforce`,'error');

    })
    .catch((error) =>{
        console.log('delete error'+error)
    })
}


}
