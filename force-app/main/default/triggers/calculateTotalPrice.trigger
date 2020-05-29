trigger calculateTotalPrice on order_line_items__c (after insert,after update,after delete,after undelete) {
    
    
    // to  calcualte each total of oli wrt od
    Decimal total;
    //to store orders
    List<order__c> orders = new List<order__c>();
    List<order_line_items__c> oliList = new List<order_line_items__c>();
    if(Trigger.isInsert || Trigger.isUpdate || Trigger.isUndelete) oliList = Trigger.New;
    else oliList = Trigger.Old;
    
         Set<Id> odids = new Set<Id>();
         
         for(order_line_items__c oli : oliList){
             odids.add(oli.orderrel__c);
         }
         
         List<order_line_items__c> olis = [select id,quantity__c,total_price__c,orderrel__c from  order_line_items__c 
                                          where orderrel__c in :odids];
                  
        Map<String,Decimal> map1 = new Map<String,Decimal>();
                    
        for(order_line_items__c oli : olis){
            if(map1.containsKey(oli.orderrel__c)){
                //add cumulative total price
                
                total = map1.get(oli.orderrel__c) + oli.total_price__c;
                map1.put(oli.orderrel__c, total);
                
            }
            else{
                map1.put(oli.orderrel__c,oli.total_price__c);
            }    
        }
        
        for(Id odid : map1.keyset()){
            order__c order = new order__c();
            order.id = odid;
            order.total_amount__c= map1.get(odid);
            
            orders.add(order);
            
        
        }
        
        update orders;
        
    

}