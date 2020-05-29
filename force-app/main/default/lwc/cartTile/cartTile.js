import { LightningElement,api } from 'lwc';

export default class CartTile extends LightningElement {

    @api garment;
    modified = false;
    initialized = false;
    quantity = 1;
    selection= 'medium'
    err;
    isEligibleQuantity = true;
    isEligibleSize = true;


    connectedCallback(){
        if(this.garment.quantity){
            this.quantity = this.garment.quantity;
            this.dispatchEvent(new CustomEvent('updatedprice' , {'detail' : this.garment.price * this.quantity}));
        }
        else this.dispatchEvent(new CustomEvent('updatedprice' , {'detail' : this.garment.price}));

        //setting initial quantity and size
        this.dispatchEvent(new CustomEvent("stateupdate",{"detail": 
                JSON.stringify({"extId":this.garment.extId,"checkedElem" : "medium","quantity":1})}))



    }

    renderedCallback(){
        if(this.initialized) return;
        else{
            if(this.garment.checkedElem){
                console.log(this.garment.checkedElem);
                //uncheck default medium size
                const mediumSizeElem = this.template.querySelector('[data-id = "medium"]');
                mediumSizeElem.checked = false;

                const checkboxElem = [...this.template.querySelectorAll('lightning-input')].filter((val,i) =>{
                    return val.type == 'checkbox' && val.name == this.garment.checkedElem
                });
                console.log(checkboxElem);
                checkboxElem[0].checked = true;
                this.initialized = true;
            }
        }
    }

    disconnectedCallback(){
        this.dispatchEvent(new CustomEvent('updatedprice' , {'detail' : -this.garment.price * this.quantity}));
    }

    deleteOrderItem(event) {
        this.dispatchEvent(new CustomEvent("delete",{"detail":this.garment
    
        })
        
        );   
    }

     handleChange(event){
        this.modified =true;
        console.log(this.template.querySelectorAll('lightning-input'));
        const allValid = [...this.template.querySelectorAll('lightning-input')]
            .reduce((validSoFar, inputCmp) => {
                        inputCmp.reportValidity();
                        return validSoFar && inputCmp.checkValidity();
            }, true);
        
        const checkboxElem = [...this.template.querySelectorAll('lightning-input')]
                             .filter((val,i) =>{
                                 return val.type == 'checkbox' && val.checked
                             });
        
        console.log(checkboxElem);

        if(checkboxElem.length == 0 || checkboxElem.length > 1) {
            this.err = 'please select only 1 size';
            this.modified = false;
            this.isEligibleSize = false;
        }
        else {
            this.err = undefined;
            this.modified = true;
            this.isEligibleSize = true;
            console.log(checkboxElem[0].name);
            this.dispatchEvent(new CustomEvent("stateupdate",{"detail": 
                JSON.stringify({"extId":this.garment.extId,"checkedElem" : checkboxElem[0].name})}))
        }                      
        if(allValid){

            if(event.target.name =='quantity') {
                if(event.target.value){
                    this.oldquantity = this.quantity;
                    this.quantity = event.target.value;
                    console.log('reached till updated price event');
                    this.dispatchEvent(new CustomEvent("updatedprice",{"detail" : 

                    parseInt(this.quantity) * this.garment.price - this.garment.price * parseInt(this.oldquantity)
                    }));
               
                    
                    this.dispatchEvent(new CustomEvent("stateupdate",{"detail" : 

                    JSON.stringify({"extId":this.garment.extId,"quantity" : this.quantity})}))
                    this.isEligibleQuantity= true;
                
                }
                else {
                    this.isEligibleQuantity= false;
                    this.modified = false;
                }
                
            }
            else this.selection = event.target.name;
        }
        else{
            this.isEligibleQuantity= false;
            this.modified = false;
        }
     }


    get calculatePrice() {
        return parseInt(this.quantity) * this.garment.price;

     }

    @api
    getEligibility(){
        return this.isEligibleQuantity && this.isEligibleSize
    }


}