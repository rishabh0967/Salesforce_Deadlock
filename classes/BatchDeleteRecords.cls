global class BatchDeleteRecords implements Database.Batchable<SObject>, Database.Stateful {

    global List<Id> recordIds;
    global List<String> ErrorFiles = new List<String>();

    public BatchDeleteRecords(List<Id> recordIds) {
        this.recordIds = recordIds;
    }

    global Database.QueryLocator start(Database.BatchableContext bc) {
        if (recordIds == null || recordIds.isEmpty()) {
            return null; 
        }
        System.debug('recordIds: ' + recordIds);

        Id idOfRecord = (Id) recordIds[0];
        SObject sObjectInstance = null;

        if (idOfRecord != null) {
            sObjectInstance = idOfRecord.getSObjectType().newSObject(idOfRecord);
        }

        if (sObjectInstance == null) {
            return null;
        }

        Schema.SObjectType sObjectType = sObjectInstance.getSObjectType();
        Schema.DescribeSObjectResult sObjectDescribe = sObjectType.getDescribe();
        String query = 'SELECT Id, CreatedDate FROM ' + sObjectDescribe.getName() + ' WHERE Id IN :recordIds';

        System.debug('query: ' + query);

        return Database.getQueryLocator(query);  
    }

    global void execute(Database.BatchableContext bc, List<SObject> data) {
        try {
            Database.DeleteResult[] results = Database.delete(data, false);
            List<String> listOfErrors = new List<String>();

            for (Integer i = 0; i < results.size(); i++) {
                Database.DeleteResult sr = results[i];
                 system.debug('sr'+' '+sr);
                if (!sr.isSuccess()) {
                    String str = 'Error: ';
                    String recordId = sr.getId();
                    for (Database.Error err : sr.getErrors()) {

                        str +=  err.getStatusCode() + ' '+ 'recordId -'+recordId+ ' - ' + err.getMessage() + '; ';
                    }
                    listOfErrors.add(str);
                }
            }

            if (!listOfErrors.isEmpty()) {
                ErrorFiles.addAll(listOfErrors);
            }

        } catch (DmlException ex) {
            System.debug('Error during batch deletion: ' + ex.getMessage());
        }
    }

    global void finish(Database.BatchableContext bc) {
        if (!ErrorFiles.isEmpty()) {
            Messaging.SingleEmailMessage message = new Messaging.SingleEmailMessage();
            message.setToAddresses(new String[] {UserInfo.getUserEmail()});

            String errorContent = String.join(ErrorFiles, '\n'); 
            Blob b = Blob.valueOf(errorContent); 
            Messaging.EmailFileAttachment efa = new Messaging.EmailFileAttachment();
            efa.setFileName('ErrorFiles.txt');  
            efa.setBody(b);

            message.setSubject('Errored out Records while Deleting Data');
            message.setHtmlBody('Some records failed to delete. Please see the attached error log.');
            message.setFileAttachments(new Messaging.EmailFileAttachment[] {efa});
            message.setOptOutPolicy('FILTER');

           
            Messaging.SendEmailResult[] results = Messaging.sendEmail(new Messaging.SingleEmailMessage[] {message});

          
            if (results[0].isSuccess()) {
                System.debug('The email was sent successfully.');
            } else {
                System.debug('The email failed to send: ' + results[0].getErrors()[0].getMessage());
            }
        } else {
            System.debug('No errors occurred, no email sent.');
        }
    }
}
