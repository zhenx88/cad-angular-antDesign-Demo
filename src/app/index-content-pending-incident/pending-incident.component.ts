import { Component, OnInit } from '@angular/core';

import { NzNotificationService } from 'ng-zorro-antd';

import { Incident } from '../common/model/incident';
import { IncidentService } from '../common/services/incident.service';
import { from } from 'rxjs/internal/observable/from';
import { interval } from 'rxjs/internal/observable/interval';
import { timer } from 'rxjs/internal/observable/timer';
import { EventAggregator } from '../common/services/eventaggregator.service';
import { StringKey } from '../common/model/stringKey';
import { Router } from '@angular/router';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators
} from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd';

@Component({
  selector: 'app-pending-incident',
  templateUrl: './pending-incident.component.html',
  styleUrls: ['./pending-incident.component.css']
})
export class PendingIncidentComponent implements OnInit {
  incidentModIsVisible = false;
  dataSet: Incident[];
  validateForm: FormGroup;

  incidentData: Incident;
  alarmName: string;
  inputPhoneNumber: string;
  inputDescription: string;
  selecIncidentTime: Date;
  inputAddress: string;
  constructor(private incidentService: IncidentService,
              private notification: NzNotificationService,
              private eventAggregator: EventAggregator,
              private nzMessageService: NzMessageService,
              private route: Router,
              private fb: FormBuilder,
              public stringKey: StringKey) { }

  ngOnInit() {
    this.getAllIncident();
    this.validateForm = this.fb.group({
      name         : [ null, [ Validators.required ] ],
      phoneNumberPrefix: [ '+86' ],
      phoneNumber      : [ null, [ Validators.required ] ],
      description          : [ null, [ Validators.required ] ],
      selecIncidentTime          : [ null, [ Validators.required ] ],
      address          : [ null, [ Validators.required ] ]
    });
  }

  // 未处理消息提示方法
  createNotification(type: string): void {
    this.notification.create(type, '未处置',
      '还有' + this.dataSet.length + '条警情没有处置完成！');
  }

  // 获取警情列表
  getAllIncident(): void {
    this.incidentService.getAllIncident()
     .subscribe(ds => {
      this.dataSet = ds;
      this.eventAggregator.publish(this.stringKey.RefreshUnTreated, this.dataSet.length);
      this.createNotification('info');
    });
  }

  // 添加一条警情到内存数据库
  addIncidentService(incident: Incident): void {
    this.incidentService.addIncident(incident).subscribe();
  }

  // 新增警情时候弹出模态框
  addIncident(): void {
    this.incidentModIsVisible = true;
  }

  // 提交警情数据
  handlesubmit(): void {
    let num = 0 ;
    this.incidentModIsVisible = true;
    // tslint:disable-next-line:forin
    for (const i in this.validateForm.controls) {
      this.validateForm.controls[ i ].markAsDirty();
      this.validateForm.controls[ i ].updateValueAndValidity();
      if (this.validateForm.controls[ i ].value == null) {
        num += 1;
      }
    }
    if (num === 0) {
    
      // 定义一个随机数a
     let a = Math.ceil(Math.random()*9);
     this.incidentData = {
       id    : 'ECUCity-20180611-0101-10236' + a,
       phoneNumber   : this.inputPhoneNumber,
       address    : this.inputAddress,
       status: 0,
       alarmName: this.alarmName,
       incidentTime: this.selecIncidentTime.toLocaleDateString(),
       description: this.inputDescription
     };

     this.addIncidentService(this.incidentData);
      // 通知右边菜单中的数字角标
      this.eventAggregator.publish(this.stringKey.RefreshUnTreated, this.dataSet.length);
      this.nzMessageService.info('添加成功');
      this.getAllIncident();
              // 清空表单数据
              this.alarmName = '';
              this.inputAddress = '';
              this.inputPhoneNumber = '';
              this.inputDescription = '';
      this.incidentModIsVisible = false;
    }

  }

  handleCancel(): void {
    this.incidentModIsVisible = false;
  }

  // 进入处置方法
  inToDisposal(id: string): void {
   this.route.navigate([ 'index/detailsIncident' ], {
     queryParams: {
       id
     }
   });
  }
}
