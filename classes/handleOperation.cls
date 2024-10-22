public with sharing class handleOperation {

    public static list<string> handleDmlOperation(List<SObject> data, String action) 
    {
   List<String> listOfErrors = new List<String>();
    try {
        if (action == 'Insert') {
            Database.SaveResult[] results = Database.insert(data, false);
            for (Integer i = 0; i < results.size(); i++) {
                Database.SaveResult sr = results[i];
                System.debug('Insert Result: ' + sr);
                if (!sr.isSuccess()) {
                    String str = 'Error: ';
                    String recordId = sr.getId();
                    for (Database.Error err : sr.getErrors()) {
                        str += err.getStatusCode() + ' ' + 'recordId - ' + recordId + ' - ' + err.getMessage() + '; ';
                    }
                    listOfErrors.add(str);
                }
                else{
                    String str = 'Success';
                    listOfErrors.add(str);
                }

            }
        } 
        else if (action == 'Update') {
            Database.SaveResult[] results = Database.update(data, false);
            for (Integer i = 0; i < results.size(); i++) {
                Database.SaveResult sr = results[i];
                System.debug('Update Result: ' + sr);
                if (!sr.isSuccess()) {
                    String str = 'Error: ';
                    String recordId = sr.getId();
                    for (Database.Error err : sr.getErrors()) {
                        str += err.getStatusCode() + ' ' + 'recordId - ' + recordId + ' - ' + err.getMessage() + '; ';
                    }
                    listOfErrors.add(str);
                }
                 else{
                    String str = 'Success';
                    listOfErrors.add(str);
                }
            }
        } 
        else if (action == 'Upsert') {
            Database.UpsertResult[] results = Database.upsert(data, false);
            for (Integer i = 0; i < results.size(); i++) {
                Database.UpsertResult sr = results[i];
                System.debug('Upsert Result: ' + sr);
                if (!sr.isSuccess()) {
                    String str = 'Error: ';
                    String recordId = sr.getId();
                    for (Database.Error err : sr.getErrors()) {
                        str += err.getStatusCode() + ' ' + 'recordId - ' + recordId + ' - ' + err.getMessage() + '; ';
                    }
                    listOfErrors.add(str);
                }
                 else{
                    String str = 'Success';
                    listOfErrors.add(str);
                }
            }
        } 
        else if (action == 'Delete') {
             List<SObject> validData = new List<SObject>();
         for (SObject record : data) {
        if (record != null) {
            validData.add(record);
           }
         }
          if (!validData.isEmpty()) {
         Database.DeleteResult[] results = Database.delete(validData, false);
            for (Integer i = 0; i < results.size(); i++) {
                Database.DeleteResult sr = results[i];
                System.debug('Delete Result: ' + sr);
                if (!sr.isSuccess()) {
                    String str = 'Error: ';
                    String recordId = sr.getId();
                    for (Database.Error err : sr.getErrors()) {
                        str += err.getStatusCode() + ' ' + 'recordId - ' + recordId + ' - ' + err.getMessage() + '; ';
                    }
                    listOfErrors.add(str);
                }
                 else{
                    String str = 'Success';
                    listOfErrors.add(str);
                }
            }
          }
        }

       return listOfErrors;

    } catch (Exception ex) {
        System.debug('Error during DML operation: ' + ex.getMessage());
        listOfErrors.add(ex.getMessage());
        return listOfErrors;
    }
    }
}