import { LightningElement, track } from 'lwc';
import cartTile from 'c/cartTile';
import getCartItems from '@salesforce/apex/checkGarments.getCartItems';
import Id from '@salesforce/user/Id';
import setCartItems from '@salesforce/apex/checkGarments.setCartItems';
import createOrder from '@salesforce/apex/checkGarments.createOrder';
import {raiseToastEvent} from 'c/util';
import { NavigationMixin } from 'lightning/navigation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class Cart extends NavigationMixin(LightningElement) {

    @track garments =[];
    @track show =true; 
    @track totalPrice = 0 ;
    totalItems =0;
    isEligible = false;
    err;
    allowDrop(ev) {
        ev.preventDefault();
      }
      
    
    connectedCallback(){
        getCartItems({userId: Id})
            .then((res) => {
                if(res!==null){
                    this.garments = JSON.parse(res);
                    console.log('respose from server'+ res);
                    if(this.garments.length >= 1) {
                        this.show =false;
                        this.totalItems = this.garments.length;
                    }
                }
                
            })
            .catch((err) =>{
                console.log('getcartItem error' + JSON.stringify(err));
            })
    }
    
    handleDrop(ev) {
        this.garment = JSON.parse(ev.dataTransfer.getData("garment"));
        this.garments.push(this.garment);
        this.show =false;
        this.totalItems = this.garments.length;
        this.setCart();
        ev.preventDefault();
      }


    handleDelete(event){
        this.garments = this.garments.filter((val,i) => {
            return val.extId !== event.detail.extId;

        })
        this.setCart();
        this.totalItems = this.garments.length;
        if (this.totalItems == 0) this.show = true;
    }

    updatePrice(event){
        console.log(event.detail);
        this.totalPrice = parseInt(event.detail) + this.totalPrice;
        
    }

    setCart(){
        console.log('cart items' + JSON.stringify(this.garments));
        setCartItems({userId: Id,garmentsJson : JSON.stringify(this.garments)})
        .then((res) => {
            console.log(res);
        })
        .catch((err) => {
            console.log('setcartItems err : '+ JSON.stringify(err));
        })
        
    }

    stateUpdate(event){
        console.log(event.detail);
        console.log('stateUpdate garments'+ JSON.stringify(this.garments));
        let eventDetail = JSON.parse(event.detail);
        let index;
        let updated = this.garments.filter((val,i) =>{
                if(val.extId == eventDetail.extId){
                    index = i;
                }
                return val.extId == eventDetail.extId
                
                
            })[0];
        if(eventDetail.checkedElem){
            updated.checkedElem = eventDetail.checkedElem;  
        }
        if(eventDetail.quantity){
            updated.quantity = eventDetail.quantity;
        }
        this.garments[index] = updated;
        this.setCart();
        console.log('state updated garments completre'+ JSON.stringify(this.garments));
    }


    Order(event){
        let eligible = true;
        this.isEligible = true;
        const cartTiles = [...this.template.querySelectorAll('c-cart-tile')].forEach((val,i) => {
            eligible = val.getEligibility();
            if(!eligible) this.isEligible = false;
        })
        if (!this.isEligible) this.err = "Please review items in your cart";
        else {
            this.err = '';
            createOrder({customOrder : JSON.stringify(this.garments)})
            .then((res) => {
                console.log(res);
                const res1= JSON.parse(res);
                this[NavigationMixin.GenerateUrl]({
                    type: 'standard__recordPage',
                    attributes: {
                        recordId: res1.id,
                        actionName: 'view',
                    },
                })
                .then((url) => {
                    const event = new ShowToastEvent({
                        "title": "Success!",
                        "message": "Order number {0} created! See it {1}!",
                        "messageData": [
                            res1.number,
                            {
                                url,
                                label: 'here'
                            }
                        ]
                    });
                    this.dispatchEvent(event);
                })
                this.garments=[];
                this.show = true;
                this.setCart();
            })
            .catch( (err) => {
                console.error(err);
                raiseToastEvent('Error creating record',err.body.message,'error')
            })
            
        }
    }
}