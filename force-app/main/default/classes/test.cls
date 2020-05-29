public class test {

public test(){
    Garment__c garment =[select extid__c,name from garment__c where extid__c='1'][0];
    garment.name ='modified blue formal shirt';
    upsert garment extId__c;
    }
}