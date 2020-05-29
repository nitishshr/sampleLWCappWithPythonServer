import { LightningElement, api,wire ,track} from 'lwc';
import {getRecord} from 'lightning/uiRecordApi'

export default class ImageCompForGarment extends LightningElement {

    @api recordId;
    garment;

    @wire(getRecord, { recordId: '$recordId', fields: [ 'Garment__c.Name','Garment__c.type__c',
       ' Garment__c.color__c',
        'Garment__c.price__c','Garment__c.url__c'] } )
    garments ({error, data}) {
            if (error) {
                this.error = error;
                this.garment = undefined;
            } else if (data) {
                this.garment = data.fields;
                console.log(this.garment);
                this.error = undefined;
            }
        }

    get name(){
        return this.garment.Name.value;
    }

    get color(){
        return this.garment.color__c.value;
    }

    get type(){
        return this.garment.type__c.value;
    }

    get price(){
        return this.garment.price__c.value;
    }
    get url(){
        return this.garment.url__c.value;
    }


}