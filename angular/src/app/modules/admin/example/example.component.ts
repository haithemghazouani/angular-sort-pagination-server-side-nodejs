import { Component, ViewChild, ViewEncapsulation } from '@angular/core';
import { ExempleService } from './exemple.service';
import { CommonModule } from '@angular/common';
import { FormGroup, FormControl } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { Employee, EmployeeTable } from './employee';
import { merge, Observable, of as observableOf, pipe } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatSort, Sort } from '@angular/material/sort';
import { MatSortModule } from '@angular/material/sort';

@Component({
  selector: 'example',
  standalone: true,
  templateUrl: './example.component.html',
  encapsulation: ViewEncapsulation.None,
  imports: [MatSortModule, CommonModule, ReactiveFormsModule, MatPaginatorModule, MatTableModule
    , MatCardModule],
})
export class ExampleComponent {
  products: any[];
  savedData: any;
  displayedColumns: string[] = [
    'id',
    'first_name',
    'last_name',
    'email',
    'avatar',
    'actions'
  ];

  empTable: EmployeeTable;

  totalData: number;
  EmpData: Employee[];

  dataSource = new MatTableDataSource<Employee>();

  isLoading = false;
  constructor(private productService: ExempleService,
    private imageUploadService: ExempleService) { }
  form: FormGroup = new FormGroup({
    image: new FormControl(),
  });

  @ViewChild('paginator') paginator: MatPaginator;
  @ViewChild('empTbSort') empTbSort = new MatSort();

  pageSizes = [3, 5, 7];

  getTableData$(pageNumber: Number, pageSize: Number) {
    return this.productService.getEmployees(pageNumber, pageSize);
  }
  onDelete(id: number): void {
    // Find the index of the item to delete
    const index = this.dataSource.data.findIndex(emp => emp.id === id);
    console.log(index)
    console.log("datasource", this.dataSource.data.length)
    if (this.dataSource.data.length === 1) {
      console.log("empty")
      this.paginator.previousPage();
    }
    if (index !== -1) {
      // Remove the item from the data source
      this.dataSource.data.splice(index, 1);
      // Refresh the data source
      this.dataSource._updateChangeSubscription();
    }
  }


  onPageChange(event: any): void {
    // Your existing code for pagination
    // ...

    // Then, you can manually navigate to the next or previous page using the paginator
    if (this.dataSource.data.length === 0) {
      this.paginator.previousPage();
    }
  }




  ngAfterViewInit() {


    this.dataSource.paginator = this.paginator;

    this.paginator.page
      .pipe(
        startWith({}),
        switchMap(() => {
          this.isLoading = true;
          return this.getTableData$(
            this.paginator.pageIndex + 1,
            this.paginator.pageSize
          ).pipe(catchError(() => observableOf(null)));
        }),
        map((empData) => {
          console.log(empData)
          if (empData == null) return [];
          this.totalData = empData.total;
          this.isLoading = false;
          return empData.data;
        })
      )
      .subscribe((empData) => {
        this.EmpData = empData;
        this.dataSource = new MatTableDataSource(this.EmpData);
        this.empTbSort.disableClear = true;
        this.dataSource.sort = this.empTbSort;
      });
  }



  ngOnInit() {
    this.productService.getProducts().subscribe(data => {
      this.products = data;
      console.log("this.produit", this.products)
    });
    this.savedData = JSON.parse(sessionStorage.getItem('myData'));
    console.log("savedData", this.savedData)


  }


  selectedFile: File | null = null;


  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  upload() {
    if (this.selectedFile) {
      this.imageUploadService.uploadImage(this.selectedFile).subscribe(
        (response) => {
          console.log('Image uploaded successfully:', response);
        },
        (error) => {
          console.error('Error uploading image:', error);
        }
      );
    }
  }
}
