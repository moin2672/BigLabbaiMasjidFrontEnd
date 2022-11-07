import { Component, OnInit } from '@angular/core';
import * as XLSX from 'xlsx';
import { Member } from '../member/member.model';
import { MemberService } from '../member/member.service';
import { DateService } from '../shared/date.service';
import { Street } from '../street/street.model';
import { StreetService } from '../street/street.service';
import Swal from 'sweetalert2';

type AOA = any[][];

@Component({
  selector: 'app-sheet',
  templateUrl: './sheet.component.html',
  styleUrls: ['./sheet.component.css'],
})
export class SheetComponent implements OnInit {
  // declaration

  data_Members: AOA = [
    ['mID', 'initials', 'name', 'fathersName', 'age', 'doorNo', 'streetName'],
    ['', '', '', '', '', '', ''],
  ];
  data_Streets: AOA = [['streetName'], []];

  fileUploaded = false;
  uploadClicked = false;
  checkResponse = [];

  data: AOA = [
    [1, 2],
    [3, 4],
  ];
  wopts: XLSX.WritingOptions = { bookType: 'xlsx', type: 'array' };
  fileName: string = 'RLM_Template.xlsx';
  outputMessage = '';
  progressBarValue = '0';
  progressBarMessage = '';

  Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer);
      toast.addEventListener('mouseleave', Swal.resumeTimer);
    },
  });

  constructor(
    private memberService: MemberService,
    private streetService: StreetService,
    private dateService: DateService,
  ) {}

  ngOnInit() {}

  onFileChange(evt: any) {
    /* wire up file reader */
    //console.log(this.data_Members.length, this.data_Streets.length);
    const target: DataTransfer = <DataTransfer>evt.target;
    if (target.files.length !== 1) throw new Error('Cannot use multiple files');
    const reader: FileReader = new FileReader();
    reader.onload = (e: any) => {
      /* read workbook */
      const bstr: string = e.target.result;
      const wb: XLSX.WorkBook = XLSX.read(bstr, { type: 'binary' });

      //console.log('wb.SheetNames=', wb.SheetNames[0]);
      if (wb.SheetNames.indexOf('Members') !== -1) {
        if (!this.fileUploaded) {
          this.fileUploaded = true;
        }
        const ws_Members: XLSX.WorkSheet = wb.Sheets['Members'];
        this.data_Members = <AOA>(
          XLSX.utils.sheet_to_json(ws_Members, { header: 1 })
        );
      }
      if (wb.SheetNames.indexOf('Streets') !== -1) {
        if (!this.fileUploaded) {
          this.fileUploaded = true;
        }
        const ws_Streets: XLSX.WorkSheet = wb.Sheets['Streets'];
        this.data_Streets = <AOA>(
          XLSX.utils.sheet_to_json(ws_Streets, { header: 1 })
        );
      }
    };
    reader.readAsBinaryString(target.files[0]);
  }

  UploadData() {
    //console.log('clicking upload data');
    //console.log('data_Members:', this.data_Members);
    //console.log('data_Streets:', this.data_Streets);

    if (!this.uploadClicked && this.fileUploaded) {
      Swal.fire({
        title: 'Do you want to upload it?',
        text: 'Please upload unique data...',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#0d6efd',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, upload it!',
      }).then((result) => {
        if (result.isConfirmed) {
          this.uploadClicked = true;

          let obj_Members = this.list_to_object_converter(this.data_Members);
          let obj_Members_length = obj_Members.length;
          let obj_Streets = this.list_to_object_converter(this.data_Streets);
          let obj_Streets_length = obj_Streets.length;

          obj_Members.forEach((object, index) => {
            if (index > 0) {
              const interval = 2000;
              const memberData: Member = {
                _id: null,
                mID: '',
                initials: object.initials,
                name: object.name,
                fathersName: object.fathersName,
                age: object.age,
                doorNo: object.doorNo,
                streetName: object.streetName,
                lastUpdatedDate: this.dateService.getTodaysDate(),
                creator: null,
              };

              setTimeout(() => {
                //console.log(memberData);
                this.progressBarMessage = 'Uploading Member Data...';
                if(memberData.initials.trim()!=="" && 
                memberData.name.trim()!=="" && 
                memberData.fathersName.trim()!=="" && 
                memberData.age.toString().trim()!=="" && 
                memberData.doorNo.trim()!=="" && 
                memberData.streetName.trim()!==""){
                  this.memberService
                    .addMemberThroughExcel(memberData)
                    .subscribe((responseData) => {
                      //console.log('responseData.message(member)=', responseData);
                      this.checkResponse.push(responseData.memberId);
                      this.progressBarValue = (
                        ((index + 1) / obj_Members_length) *
                        100
                      ).toFixed();
                    });
                }
              }, index * interval);
            }
          });

          setTimeout(() => {
            this.outputMessage =
              this.outputMessage + 'Members Data Uploaded Successfully...<br>';
          }, 3000 * obj_Members_length);

          setTimeout(() => {
            this.progressBarValue = '0';
          }, 1000 * obj_Members_length);

          obj_Streets.forEach((object, index) => {
            if (index > 0) {
              const interval = 2000;
              const streetData: Street = {
                _id: null,
                streetName: object.streetName,
                creator: null,
              };

              setTimeout(() => {
                //console.log(streetData);
                this.progressBarMessage = 'Uploading Street Data...';
                if (streetData.streetName.trim() !== '') {
                  this.streetService
                    .addStreetThroughExcel(streetData)
                    .subscribe((responseData) => {
                      //console.log('responseData.message(street)=',responseData);
                      this.checkResponse.push(responseData.streetId);
                      this.progressBarValue = (
                        ((index + 1) / obj_Streets_length) *
                        100
                      ).toFixed();
                    });
                }
              }, index * interval);
            }
          });

          setTimeout(() => {
            this.progressBarMessage = 'Completed...';
            this.outputMessage =
              this.outputMessage + 'Streets Data Uploaded Successfully...<br>';
          }, 3000 * obj_Streets_length);

          //console.log('this.checkResponse.length=', this.checkResponse.length);
          //console.log('obj_Members.length=', obj_Members.length);
          //console.log('obj_Streets.length=', obj_Streets.length);

          
            // Swal.fire({
            //   title: 'Data uploaded successfully',
            //   text:'Kindly cross verify it.',
            //   icon: 'success',
            //   iconHtml: '',
            //   confirmButtonText: 'Okay',
            //   confirmButtonColor: '#0d6efd',
            //   cancelButtonText: '',
            //   showCancelButton: false,
            //   showCloseButton: false,
            // });
            // this.router.navigate(['/home']);
         
        } else {
          Swal.fire({
            title: 'Cancelled',
            text: 'No Data uploaded... :)',
            icon: 'error',
            confirmButtonColor: '#0d6efd',
          });
        }
      });
    }
  }

  export(): void {
    /* generate worksheet */
    const ws_Members: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(this.data_Members);
    const ws_Streets: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(this.data_Streets);
    /* generate workbook and add the worksheet */
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws_Members, 'Members');
    XLSX.utils.book_append_sheet(wb, ws_Streets, 'Streets');

    /* save to file */
    XLSX.writeFile(wb, this.fileName);
  }

  list_to_object_converter(data) {
    let result = [];
    // //console.log("data=",data)
    data.forEach((arr) => {
      const obj = {};
      arr.forEach((elem, i) => {
        obj[data[0][i]] = elem;
      });
      result.push(obj);
    });

    return result;
  }

  object_to_array_converter(result) {
    let array_output = [];

    result.forEach((val) => {
      // //console.log("val",val, Object.keys(val))
      let out = [];
      for (const key of Object.keys(val)) {
        // //console.log(key)
        if (array_output.length === 0) {
          out.push(key);
        } else {
          out.push(val[key]);
        }
      }
      array_output.push(out);
    });
    // //console.log("=>",array_output)
    return array_output;
  }
}
