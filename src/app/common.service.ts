import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { AlertController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { Observable,BehaviorSubject } from 'rxjs';



@Injectable({
  providedIn: 'root'
})
export class CommonService {
  apiUrl = 'https://fakestoreapi.com/products?offset=0&limit=10';
  
  private updatedCounts: Map<number, BehaviorSubject<number>> = new Map<number, BehaviorSubject<number>>();


  constructor(
    private toastController: ToastController,
    public alertCtrl: AlertController,
    private http: HttpClient) {}

    // getProducts(sendData:any) {
    //   const{offset,limit}=sendData;
    //   return this.http.get(this.apiUrl);

    // }

    getProducts(offset: number, limit:any) {
      return this.http.get(`${this.apiUrl}?offset=${offset}&limit=${limit}`);
    }

    
    
   async presentToast(msg: any) {
      const toast = await this.toastController.create({
        message: msg,
        duration: 1500,
        position: 'bottom',
      });
    
      await toast.present();
    }
  
    async presentAlert(header: string, message: string):Promise<boolean> {
      return new Promise(async (resolve) => {

      const alert = await this.alertCtrl.create({
        header: header,
        message: message,
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel',
            handler: () => resolve(false)
          },
          {
            text: 'OK',
            handler: () => resolve(true)
          }
        ]
      });
      
      await alert.present();
    });
}



setUpdatedCount(productId: number, count: number) {
  if (!this.updatedCounts.has(productId)) {
    this.updatedCounts.set(productId, new BehaviorSubject<number>(count));
  } else {
    this.updatedCounts.get(productId)!.next(count);
  }
}

getUpdatedCount(productId: number): Observable<number> {
  if (!this.updatedCounts.has(productId)) {
    this.updatedCounts.set(productId, new BehaviorSubject<number>(0));
  }
  return this.updatedCounts.get(productId)!.asObservable();
}

}