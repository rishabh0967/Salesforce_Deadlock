public with sharing class AccountHelper {

    @InvocableMethod
    public static Void queryAccountFOrListView(list<String> recordId)
    {
         system.debug('listOfIds'+' '+recordId);
    }

     @AuraEnabled(Cacheable = true)
    public static List<SObject> queryRecordsToDelete(String recordId) {
      Id idOfRecord = (Id)recordId;
    SObject sObjectInstance = null;
    
    if (recordId != null) {
        sObjectInstance = idOfRecord.getSObjectType().newSObject(idOfRecord);
    }
    if (sObjectInstance == null) {
        return null;
    }

    Schema.SObjectType sObjectType = sObjectInstance.getSObjectType();
    Schema.DescribeSObjectResult sObjectDescribe = sObjectType.getDescribe();
    
    String objectApiName = sObjectDescribe.getName();

     list<CreateRelatedSetting__mdt> createRelatedObj = getCreateRelatedSettingsWithTag(objectApiName);
     
     String fieldSetName = '';
     String filterQuery = ''; 
     if(createRelatedObj != null && createRelatedObj.size() > 0)
     {
         fieldSetName = createRelatedObj[0].FieldsetName__c;
         filterQuery =  createRelatedObj[0].FilterSOQLQuery__c;
     }
    
     list<FieldsetFieldInfo> fields = getFieldsByFieldSetName(objectApiName,fieldSetName);

     system.debug('sObjectDescribe'+' '+sObjectDescribe);

     system.debug('fields'+' '+fields);

    String query = 'SELECT Id,createdDate  ';
    if (sObjectDescribe.fields.getMap().containsKey('Name')) {

       query += ', ' + 'Name';
}

    for(FieldsetFieldInfo info : fields){
            query += ', ' + info.apiName;
        } 
         system.debug('query'+' '+query);

    query += ' FROM ' + sObjectDescribe.getName(); //+ ' order by createddate  LIMIT 5 ';
    if(filterQuery != null && filterQuery != '')
    {
         query += ' '+filterQuery;
    }
     system.debug('query'+' '+query);
    return Database.query(query);
       
    }

     @AuraEnabled(Cacheable = true)
    public static List<SObject> filterQueryData(String recordId,String filterQueryRecords) {
        try{
      Id idOfRecord = (Id)recordId;
    SObject sObjectInstance = null;
    
    if (recordId != null) {
        sObjectInstance = idOfRecord.getSObjectType().newSObject(idOfRecord);
    }
    if (sObjectInstance == null) {
        return null;
    }

    Schema.SObjectType sObjectType = sObjectInstance.getSObjectType();
    Schema.DescribeSObjectResult sObjectDescribe = sObjectType.getDescribe();
    
    String objectApiName = sObjectDescribe.getName();

     list<CreateRelatedSetting__mdt> createRelatedObj = getCreateRelatedSettingsWithTag(objectApiName);
     
     String fieldSetName = '';
     String filterQuery = ''; 
     if(createRelatedObj != null && createRelatedObj.size() > 0)
     {
         fieldSetName = createRelatedObj[0].FieldsetName__c;
         filterQuery =  createRelatedObj[0].FilterSOQLQuery__c;
     }
    
     list<FieldsetFieldInfo> fields = getFieldsByFieldSetName(objectApiName,fieldSetName);

     system.debug('sObjectDescribe'+' '+sObjectDescribe);

     system.debug('fields'+' '+fields);

    String query = 'SELECT Id,createdDate  ';
    if (sObjectDescribe.fields.getMap().containsKey('Name')) {

       query += ', ' + 'Name';
}

    for(FieldsetFieldInfo info : fields){
            query += ', ' + info.apiName;
        } 
        system.debug('query'+' '+query);

    query += ' FROM ' + sObjectDescribe.getName(); //+ ' order by createddate  LIMIT 5 ';
     if(filterQueryRecords != null && filterQueryRecords != '')
    {
        
        query += ' '+ filterQueryRecords;
        system.debug('query9876'+' '+query);
        return Database.query(query);

    }
   
    if(filterQuery != null && filterQuery != '')
    {
         query += ' '+filterQuery;
    }
   
     system.debug('query'+' '+query);
    return Database.query(query);
        }
       catch (Exception e) {
            throw new AuraHandledException('An error occurred while querying contacts: ' + e.getMessage());
        }
       
    }

     @AuraEnabled
     public static Integer DeleteSobjectRecords(list<Id> recordIds)
     {
        //try{
     if (recordIds == null || recordIds.isEmpty()) {
            return null;
        }
     system.debug('recordIds'+' '+recordIds);
    Id idOfRecord = (Id)recordIds[0];
    SObject sObjectInstance = null;
    
    if (idOfRecord != null) {
        sObjectInstance = idOfRecord.getSObjectType().newSObject(idOfRecord);
    }
    if (sObjectInstance == null) {
        return null;
    }

    Schema.SObjectType sObjectType = sObjectInstance.getSObjectType();
    Schema.DescribeSObjectResult sObjectDescribe = sObjectType.getDescribe();
    String query = 'SELECT Id,createdDate ';
    query += ' FROM ' + sObjectDescribe.getName() + ' WHERE Id IN :recordIds';
    List<SObject> result = Database.query(query);
    Integer CountRecord = result.size();

    DELETE result;
    return CountRecord;

     }

     @AuraEnabled
    public static String  startBatchDelete(List<Id> recordIds) {
        try{
    if (recordIds != null && recordIds.size() > 0) {
        BatchDeleteRecords batch = new BatchDeleteRecords(recordIds);
         Id jobId = Database.executeBatch(batch, 1);
         system.debug('jobId'+' '+jobId);
            return jobId; 
    }
    return null;
    }
    catch(Exception e){

          System.debug('Error: ' + e.getMessage());
        return 'Error during batch delete: ' + e.getMessage();

    }
}

@AuraEnabled
public static String getBatchJobStatus(Id jobId) {
    try {
        AsyncApexJob job = [SELECT Status FROM AsyncApexJob WHERE Id = :jobId LIMIT 1];
        return job.Status;
    } catch (Exception e) {
        System.debug('Error retrieving batch job status: ' + e.getMessage());
        return 'Error';
    }
}




      public static list<CreateRelatedSetting__mdt> getCreateRelatedSettingsWithTag(string objectApiName){

        List<CreateRelatedSetting__mdt> settings = [SELECT Id,FieldsetName__c,FilterSOQLQuery__c,HostObjectId__c
        FROM 
            CreateRelatedSetting__mdt
        WHERE 
            HostObjectId__r.QualifiedApiName =:objectApiName
        LIMIT 1];
       return settings;
    }
    
    @AuraEnabled
     public static Decimal getCreateRelatedSettings(list<Id> recordIds,Integer selectedRecordSize){
       
         if (recordIds == null || recordIds.isEmpty()) {
            return selectedRecordSize ;
        }
     system.debug('recordIds'+' '+recordIds);
    Id idOfRecord = (Id)recordIds[0];
    SObject sObjectInstance = null;
    
    if (idOfRecord != null) {
        sObjectInstance = idOfRecord.getSObjectType().newSObject(idOfRecord);
    }
    if (sObjectInstance == null) {
        return selectedRecordSize;
    }

    Schema.SObjectType sObjectType = sObjectInstance.getSObjectType();
    Schema.DescribeSObjectResult sObjectDescribe = sObjectType.getDescribe();
    String objectApiName = sObjectDescribe.getName();

     List<CreateRelatedSetting__mdt> settings = [SELECT Id,FieldsetName__c,FilterSOQLQuery__c,HostObjectId__c,AsyncCount__c
        FROM 
            CreateRelatedSetting__mdt
        WHERE 
            HostObjectId__r.QualifiedApiName =:objectApiName
        LIMIT 1];

         system.debug('settings987678'+' '+settings);

        if(settings.size() > 0 && settings[0].AsyncCount__c != null)
       return settings[0].AsyncCount__c;

       return selectedRecordSize;
    }
     
     
   
      public static List<FieldsetFieldInfo> getFieldsByFieldSetName(String objectApiName, String fieldSetName){

       // String fieldSetName = String.ValueOf(System.Label.Configure_Fields_Set);
        List<FieldsetFieldInfo> fsFields = new List<FieldsetFieldInfo>();
        if(String.isBlank(objectApiName) || String.isBlank(fieldSetName)){
            return fsFields;
        }
        String fsName = fieldSetName.toLowerCase();
        System.Type objectType = Type.forName(objectApiName);
        if(objectType==null){
            return fsFields;
        }
        Map<String, Schema.FieldSet> fsMap = ((SObject)objectType.newInstance()).getSObjectType().getDescribe().FieldSets.getMap();
        if(fsMap == null){
            return fsFields;
        }
        if(fsMap.containsKey(fsName)){
            for(Schema.FieldSetMember memberField: fsMap.get(fsName).getFields()){
                FieldsetFieldInfo fsField = new FieldsetFieldInfo(memberField);
                fsFields.add(fsField);
            }
            return fsFields;
        } 
        return fsFields;
    }

     


   

    @AuraEnabled(Cacheable = true)
    public static List<Account> queryAccounts() {
        return [SELECT Id, Name,description, Website,BillingCity,BillingState,BillingAddress,BillingCountry,BillingPOstalCode, Phone FROM Account LIMIT 10];
    }

     @AuraEnabled(Cacheable = true)
    public static List<Opportunity> queryOpportunitys() {
        return [SELECT Id, Name,VehicleType__c,IssueReported__c,Amount from Opportunity WHERE IssueReported__c = false];
    }

     @AuraEnabled(Cacheable = true)
    public static List<Opportunity> queryRelatedOpportunitys(Id recordId) {
        return [SELECT Id, Name,VehicleType__c,IssueReported__c,Amount from Opportunity WHERE ContactId =:recordId];
    }

    @AuraEnabled
   public static string updateContacts(Object data) {
    system.debug('data'+' '+data);
    List<Contact> contactsForUpdate = (List<Contact>) JSON.deserialize(
         JSON.serialize(data),
         List<Contact>.class
    );
    try {
        update contactsForUpdate;
        return 'Success: contacts updated successfully';
    }
    catch (Exception e) {
        return 'The following exception has occurred: ' + e.getMessage();
    }
}

    @AuraEnabled
    public static Boolean updateOpportunity(list<object> data)
    {
       system.debug('data'+' '+data);
         List<SObject> recordsToUpsert = new List<SObject>();
        for(object obj : data)
        {
            Map<object,object> fields = (Map<object,object>)obj;
           Id recordId = (Id)fields.get('Id');
            SObject aObject = null;
             if(recordId!=null){
                    aObject = recordId.getSobjectType().newSObject(recordId);
                    aObject.Id = recordId;
            }else{
                aObject = new Opportunity();
            }
          for(object key : fields.keySet())
          {
              if(key == 'IssueReported__c'){

               aObject.put((string)key,True);
              }
          }
         recordsToUpsert.add(aObject);

        }
          system.debug('recordsToUpsert'+' '+recordsToUpsert);
        if(recordsToUpsert.size() > 0)
        {
         upsert recordsToUpsert;
         return true;
        }
        return false;
        
    }

     @AuraEnabled(Cacheable = true)
    public static List<Contact> queryFilterContact() {
        try {
           
            return [SELECT Id, Name, Title, Phone, Email, FirstName, LastName FROM Contact];
        } catch (Exception e) {
            throw new AuraHandledException('An error occurred while querying contacts: ' + e.getMessage());
        }
    }

    @AuraEnabled(Cacheable = true)
    public static List<Contact> queryContacts(String title) {
        try {
            String titlePattern = '%' + title + '%';
            return [SELECT Id, Name, Title, Phone, Email, FirstName,LeadSource, LastName FROM Contact];
      } catch (Exception e) {
            throw new AuraHandledException('An error occurred while querying contacts: ' + e.getMessage());
        }
    }


    @AuraEnabled
     public static List<Account> createContactRecords(list<Id> contactIds)
     {
        try{
       
        list<Contact> listOfContacts = [SELECT Id,FirstName,LastName,title,Phone,Email from Contact WHERE Id IN : contactIds];
        list<Account> AccountToInsert = new list<Account>();
        for(Contact con : listOfContacts)
        {
            Account acc = new Account();
            acc.Name = con.FirstName +'-' + con.LastName;
            acc.Phone = con.Phone;
            AccountToInsert.add(acc);
        }
        if(AccountToInsert.size() > 0)
          insert AccountToInsert;
          
         return AccountToInsert;

        } catch (Exception e) {
            throw new AuraHandledException('An error occurred while creating accounts: ' + e.getMessage());
        }
    



     }
     
     @AuraEnabled(Cacheable = true)
     public static user getuserDetailsDefault()
     {
        try{
        Id currentUserId = UserInfo.getUserId();
        User currentUser = [SELECT Id, ProfileId, Profile.Name,Name FROM User WHERE Id = :currentUserId LIMIT 1]; 

        return currentUser;
        }
        catch (Exception e) {
            throw new AuraHandledException('An error occurred: ' + e.getMessage());
        }

     }

     @AuraEnabled
     public static Contact createContact(Map<String, Object> data) {  
        system.debug('data'+' '+data);
        try{
        Contact newContact = new Contact();  
        for (String fieldName : data.keySet()) {
            String value; 

            if(fieldName == 'BillingAddress' || fieldName == 'ShippingAddress')
             {
                object objectAddress = (object) data.get(fieldName);
                if(objectAddress != NULL)
                {   
                Map<object,object> objectData = (Map<object,object>)objectAddress;
                System.debug('objectData'+' '+objectData);
                string addressJson = JSON.serialize(objectAddress);
                Map<String, Object> jsonResponse = (Map<String, Object>) JSON.deserializeUntyped(addressJson);
                system.debug('jsonResponse'+' '+jsonResponse);

                Map<String, String> addressMap = (Map<String, String>) JSON.deserialize(addressJson, Map<String, String>.class);
                system.debug('addressMap'+' '+addressMap);

                for(String str : addressMap.keySet())
                {
                    if(fieldName == 'BillingAddress'){
                        if(str == 'BillingState'){
                         String BillingState  = (string)addressMap.get(str);
                            system.debug('BillingState'+' '+BillingState);
                            newContact.AssistantName = BillingState;

                        }
                          
                    }
               }
                }
              
                
            }
            else{
             value= (String)data.get(fieldName);
            }
           system.debug('value'+' '+value);
           if(fieldName == 'Id')
           {
            newContact.AccountId = value;
           }
           else if(fieldName == 'Name')
           {
            newContact.FirstName = value;
            newContact.LastName = value;

           }
           else if(fieldName == 'UserId__c')
           {
            newContact.UserId__c = value;
          
           }
        
        }
        insert  newContact;
        return newContact;
    }
    catch(Exception e)
    {
        throw new AuraHandledException('An error occurred while creating contacts: ' + e.getMessage());
    }
}

     @AuraEnabled(Cacheable = true)
    public static List<Map<String, String>> getAllObjectNames() 
    {
        List<Map<String, String>> objectInfoList = new List<Map<String, String>>();
        Map<String, Schema.SObjectType> globalDescribeMap = Schema.getGlobalDescribe();

        for (String apiName : globalDescribeMap.keySet()) {
            Schema.SObjectType objectType = globalDescribeMap.get(apiName);
            Schema.DescribeSObjectResult describeResult = objectType.getDescribe();

            Map<String, String> objectInfo = new Map<String, String>();
            objectInfo.put('Label', describeResult.getLabel());
            objectInfo.put('APIName', describeResult.getName());

            objectInfoList.add(objectInfo);
        }

        return objectInfoList;
    }

}