import { LightningElement, wire, track } from 'lwc';
import {registerListener,unregisterAllListeners} from 'c/pubsub'
import { CurrentPageReference,NavigationMixin } from 'lightning/navigation';

export default class ImageCmp extends NavigationMixin(LightningElement) {

    @track imgsrc;
    @track showNavigation;
    @wire(CurrentPageReference) pageRef;
    @track parsedJson;
    connectedCallback(){
        registerListener('selectedUrl',this.handleUrlEvent,this);
    }

    handleUrlEvent = (selectedjson) =>{
        console.log(selectedjson);
        this.parsedJson =JSON.parse(selectedjson);
        this.imgsrc = this.parsedJson.selectedUrl;
        if(this.parsedJson.garmentId !== 'Not Exist') this.showNavigation = true;
        else this.showNavigation = false;
    }

    disconnectedCallback(){
        unregisterAllListeners(this);
    }

    navigateToRec(event){

        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: this.parsedJson.garmentId,
                objectApiName: 'Garment__c',
                actionName: 'view'
            }
        });
    }

    handleDrag(event){
        event.dataTransfer.setData("garment", JSON.stringify(this.parsedJson));
    }

    

}