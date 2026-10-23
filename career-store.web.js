import AsyncStorage from '@react-native-async-storage/async-storage';

// Career histories outgrow localStorage on some browsers. Keep legacy reads so
// v0.1/v0.2 users migrate without exporting or losing their existing career.
let opening;
function database(){
  if(!opening)opening=new Promise((resolve,reject)=>{
    const request=indexedDB.open('cricket-empire',1);
    request.onupgradeneeded=()=>request.result.createObjectStore('careers');
    request.onsuccess=()=>{const db=request.result;db.onversionchange=()=>{db.close();opening=null;};resolve(db);};
    request.onerror=()=>{opening=null;reject(request.error);};
    request.onblocked=()=>{opening=null;reject(new Error('Close other game tabs and try saving again.'));};
  });
  return opening;
}
async function getItem(key){
  let value;
  try{
    const db=await database();
    value=await new Promise((resolve,reject)=>{
      const request=db.transaction('careers','readonly').objectStore('careers').get(key);
      request.onsuccess=()=>resolve(request.result);
      request.onerror=()=>reject(request.error);
    });
  }catch(error){
    // An existing legacy save remains recoverable when IndexedDB is unavailable.
    const legacy=await AsyncStorage.getItem(key);
    if(legacy!==null)return legacy;
    throw error;
  }
  return value===undefined?AsyncStorage.getItem(key):value;
}
async function write(key,value){
  const db=await database();
  await new Promise((resolve,reject)=>{
    const tx=db.transaction('careers','readwrite');
    tx.objectStore('careers').put(value,key);
    tx.oncomplete=()=>resolve();
    tx.onerror=()=>reject(tx.error);
    tx.onabort=()=>reject(tx.error||new Error('Career save was interrupted.'));
  });
}
// Serialize writes so a fast succession of ball/tactic actions cannot publish
// an older save after a newer one. Each failed operation leaves the queue usable.
let pending=Promise.resolve();
function setItem(key,value){const next=pending.catch(()=>{}).then(()=>write(key,value));pending=next;return next;}
export default {getItem,setItem};
