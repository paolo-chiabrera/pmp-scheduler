import EventEmitter from 'events';
import path from 'path';
import {fork} from 'child_process';

import schedule from 'node-schedule';

import _ from 'lodash';

import main from './modules/main';

export default class PmpScheduler extends EventEmitter {
  constructor(options) {
    super();

    this.options = {
      scheduler: {
        refreshInterval: 30000
      },
      scraper: {
        folderPath: './images',
        pmpApiUrl: null,
        request: {
          json: true,
          headers: {}
        }
      }
    };

    this.options.scraper = _.merge(this.options.scraper, options.scraper);

    this.activeSources = [];
    this.jobs = {};
    this.process = {};
  }

  clearJobs() {
    _.each(this.jobs, job => {
      job.cancel();
    });

    this.jobs = {};
  }

  clearProcesses() {
    _.each(this.process, proc => {
      proc.kill();
    });

    this.process = {};
  }

  startJob(sourceId) {
    this.emit('job-start', sourceId);

    const args = [
      '--source=' + sourceId,
      '--options=' + JSON.stringify(this.options.scraper)
    ];

    this.process[sourceId] = fork(path.resolve('node_modules', 'pmp-scheduler', 'dist', 'worker.js'), args);

    this.process[sourceId].on('message', msg => {
      this.emit('job-message', sourceId, msg);
    });

    this.process[sourceId].on('exit', code => {
      this.emit('job-end', sourceId, code.toString());
    });
  }

  setupJobs() {
    this.clearProcesses();

    this.clearJobs();

    _.each(this.activeSources, source => {
      const id = source.id;

      this.jobs[id] = schedule.scheduleJob('job_' + id, source.schedule, () => {
        this.startJob(id);
      });
    });

    this.emit('jobs', this.jobs);

    this.emit('ready', this.jobs);
  }

  updateSchedule() {
    main.getActiveSources(_.pick(this.options.scraper, ['pmpApiUrl','request']), (err, res) => {
      if (err) {
        this.emit('error', err);
        return;
      }

      const scheduleHasChanged = !_.isEqual(res.sources, this.activeSources);

      if (scheduleHasChanged) {
        this.activeSources = res.sources;
        this.emit('sources', this.activeSources);
        this.setupJobs();
      }
    });
  }

  init() {
    this.updateSchedule();

    setInterval(() => {
      this.updateSchedule();
    }, this.options.scheduler.refreshInterval);
  }
}
