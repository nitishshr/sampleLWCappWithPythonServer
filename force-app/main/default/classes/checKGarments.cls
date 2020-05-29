public class checKGarments {

    @AuraEnabled
    public static Boolean insertCheck(String extId,Garment__c garment){
        List<Garment__c> garmentCheck = [Select id,extId__c from Garment__c where extId__c = :extId ];
        // if garment exists then update
        if(garmentCheck.size() == 1){
            DateTime dt = DateTime.now();
            String dateTimeStr = dt.format('yyyy/MM/dd hh:mm:ss');
            garment.last_synced__c = dt;
            garment.Is_Synced__c =true;
            upsert garment extID__c;
            return true;
        }
        return false;     

    }
    @AuraEnabled
    public static Boolean deleteGarment(String extId){
        List<Garment__c> garmentCheck = [Select id,extId__c from Garment__c where extId__c = :extId ];
        // if garment exists then update
        if(garmentCheck.size() == 1){
            delete garmentCheck;
            return true;
        }
        return false;
    }

    @AuraEnabled
    public static string getGarmentId(String extId){
        List<Garment__c> garmentCheck = [Select id,extId__c from Garment__c where extId__c = :extId ];
        if(garmentCheck.size() == 1){
            return garmentCheck[0].id;
        }
        return 'Not Exist';
        
    }

    @AuraEnabled
    public static string getCartItems(String userId){
        List<cart_item__c> cartItem = [Select CreatedById,garmentsJson__c from cart_item__c where CreatedById = :userId ];
        if(cartItem.size() == 1 ) return cartItem[0].garmentsJson__c;
        else return null;
    }

    @AuraEnabled
    public static string setCartItems(String userId,String garmentsJson){
        List<cart_item__c> cartItem = [Select CreatedById,garmentsJson__c from cart_item__c where CreatedById = :userId ];
        if(cartItem.size() == 1 ) {
            cartItem[0].garmentsJson__c = garmentsJson;
            update cartItem;
            return cartItem[0].id;
        }
        else {
            cart_item__c ci = new cart_item__c();
            ci.garmentsJson__c = garmentsJson;
            insert ci;
            return 'saved';
        }
        

    }

    @AuraEnabled
    public static string createOrder(List<CustomOrderLineItem> customOrder){
        List<Garment__c> garments = new List<Garment__c>();
        Map<String,String> map1 = new Map<String, String>();
        Map<String,Garment__c> map2 = new Map<String,Garment__c>();
        List<order_line_items__c> olis =new List<order_line_items__c>();

        for(CustomOrderLineItem coli : customOrder){
            Garment__c garment = new Garment__c();
            garment.name= coli.name;
            garment.color__c = coli.color;
            garment.extId__c = coli.extId;
            garment.price__c = coli.price;
            garment.type__c = coli.type;
            garment.url__c = coli.url;
            
            map2.put(garment.extId__c,garment);

        }
        garments = map2.values();
        upsert garments extID__c;

        for(Garment__c garment : garments ){
            map1.put(garment.extId__c,garment.id);
        }

        order__c order = new order__c();
        insert order;

        for(CustomOrderLineItem coli : customOrder){
            order_line_items__c oli = new order_line_items__c();
                oli.quantity__c = coli.quantity;
                oli.size__c = coli.checkedElem;
                oli.Garment__c = map1.get(coli.extId);
                oli.orderrel__c = order.id;
                olis.add(oli);
        }
        upsert olis;
		
        Order__c ordernew = [select name from order__c where id = :order.id][0];
        Map<String,String> map3 = new map<String,String>();
        map3.put('id',ordernew.id);
        map3.put('number',ordernew.name);
        String info = JSON.serialize(map3);
        return info;
    }
        
    

     public class CustomOrderLineItem{
            @AuraEnabled
            public String color {get; set;}
            @AuraEnabled
            public String extId {get; set;}
            @AuraEnabled
            public String name {get; set;}
            @AuraEnabled
            public Decimal price {get; set;}
            @AuraEnabled
            public String type {get; set;}
            @AuraEnabled
            public String url {get; set;}
            @AuraEnabled
            public String checkedElem {get; set;}
            @AuraEnabled
            public Integer quantity {get; set;}
                
        }



}