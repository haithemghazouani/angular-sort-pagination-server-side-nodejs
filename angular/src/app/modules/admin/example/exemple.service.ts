import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from 'app/core/auth/auth.service';
import { Observable } from 'rxjs';
import { EmployeeTable } from './employee';

@Injectable({
  providedIn: 'root'
})
export class ExempleService {

  private apiUrl = 'http://localhost:3000/api/produits'; // Replace with your backend URL

  constructor(private http: HttpClient,
    private auth:AuthService) { }
    public getEmployees(
      pageNumber: Number,
      pageSize: Number
    ): Observable<EmployeeTable> {
      const url = `http://localhost:3000/api/employees?page=${pageNumber}&per_page=${pageSize}`;
  
      return this.http.get<EmployeeTable>(url);
    }
    
  getProducts(): Observable<any> {
    // Add headers if needed (e.g., for authentication)
     const headers = new HttpHeaders().set('Authorization', this.auth.accessToken);
    console.log("header",this.auth.accessToken)
    // You can pass the headers as an object like this:
     const httpOptions = { headers: headers };

    return this.http.get(this.apiUrl,httpOptions);
  }

  uploadImage(imageFile: File): Observable<any> {
    const formData = new FormData();
    formData.append('image', imageFile);

    return this.http.post<any>('http://localhost:3000/upload', formData);
  }
}
