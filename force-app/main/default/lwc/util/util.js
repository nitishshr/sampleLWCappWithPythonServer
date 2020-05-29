import { LightningElement } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { createRecord } from 'lightning/uiRecordApi';

const createGarment = (fields, objectApiNAme, callback) => {
        
        const recordInput = { apiName: objectApiNAme, fields};
        console.log(recordInput);
        createRecord(recordInput)
            .then(garment => {
                const garmentId = garment.id;
                console.log(garmentId);
                dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Garment created',
                        variant: 'success',
                    }),
                );
                callback(garmentId);
                
            })
            .catch(error => {
                console.error(error.body);
                dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error creating record',
                        message: error.body.message,
                        variant: 'error',
                    }),
                );
            });
            
};

const raiseToastEvent = (title,message,variant) =>{
    dispatchEvent(
        new ShowToastEvent({
            title,
            message,
            variant
        }),
    );
}



export {createGarment,raiseToastEvent};
