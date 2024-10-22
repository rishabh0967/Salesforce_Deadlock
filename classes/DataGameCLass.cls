public with sharing class DataGameCLass {
    
    @AuraEnabled(Cacheable = true)
    public static list<string> getAllFieldForRelatedObects(String objectApiName)
    {
    list<string> fields = new list<String>();
    Map<string,list<String>> objectsFields = new  Map<string,list<String>>();
    Schema.SObjectType sObjectType = Schema.getGlobalDescribe().get(objectApiName);
    Schema.DescribeSObjectResult describeResult = sObjectType.getDescribe();
   Map<String, Schema.SObjectField> fieldMap = describeResult.fields.getMap();

   for (Schema.SObjectField field : fieldMap.values()) {
    Schema.DescribeFieldResult fieldDescribe = field.getDescribe();
    fields.add(fieldDescribe.getName());
 }
  return fields;

}

@AuraEnabled
public static  list<String> importRecords(list<object> records, Integer batchCount,String objectApiName,String action)
{
   system.debug('action'+' '+action);
    Map<String, String> fieldTypesMap = new Map<String, String>();
    Schema.SObjectType sObjectType = Schema.getGlobalDescribe().get(objectApiName);
    if (sObjectType == null) {
        return null; 
    }  
    Schema.DescribeSObjectResult describeResult = sObjectType.getDescribe();
    Map<String, Schema.SObjectField> fieldMap = describeResult.fields.getMap();
    for (Schema.SObjectField field : fieldMap.values()) {

        Schema.DescribeFieldResult fieldDescribe = field.getDescribe();
        String fieldName = fieldDescribe.getName();
        String fieldType = fieldDescribe.getType().name();
        fieldTypesMap.put(fieldName, fieldType);

    }
    List<SObject> listOfDataToInsert = new List<SObject>();
    for(object data : records)
    {
         String objJson = JSON.serialize(data);
       Map<String, Object> deserializeData = (Map<String, Object>) JSON.deserializeUntyped(objJson);
       SObject newObj = sObjectType.newSObject();

        for (String fieldName : deserializeData.keySet())
         {

            String dataType = fieldTypesMap.get(fieldName);
            Object fieldValue = deserializeData.get(fieldName);
            
            if (dataType == 'STRING') {
                newObj.put(fieldName, (String) fieldValue);
            } else if (dataType == 'DECIMAL') {
                newObj.put(fieldName, (Decimal) fieldValue);
            } else if (dataType == 'INTEGER') {
                newObj.put(fieldName, (Integer) fieldValue);
            } else if (dataType == 'DOUBLE') {
                newObj.put(fieldName, (Double) fieldValue);
            } else if (dataType == 'DATE') {
                newObj.put(fieldName, (Date) fieldValue);
            } else if (dataType == 'DATETIME') {
                newObj.put(fieldName, (Datetime) fieldValue);
            } else if (dataType == 'BOOLEAN') {
                newObj.put(fieldName, (Boolean) fieldValue);
            } else if (dataType == 'ID' || dataType == 'REFERENCE') {
                newObj.put(fieldName, (Id) fieldValue); 
            } else if (dataType == 'PERCENT') {
                newObj.put(fieldName, (Decimal) fieldValue);
            } else if (dataType == 'CURRENCY') {
                newObj.put(fieldName, (Decimal) fieldValue);
            } else if (dataType == 'TEXTAREA' || dataType == 'PHONE' || dataType == 'EMAIL' || dataType == 'URL') {
                newObj.put(fieldName, (String) fieldValue); 
            }
        }
        listOfDataToInsert.add(newObj);
    }

        
    list<String> listOfStatus = handleOperation.handleDmlOperation(listOfDataToInsert, action); 
    return listOfStatus;

    
}


}