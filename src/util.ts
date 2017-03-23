/**
 * Created by Holger Stitz on 19.12.2016.
 */

import * as moment from 'moment';
import * as d3 from 'd3';
import * as events from 'phovea_core/src/event';
import {AppConstants} from './app_constants';
import {hash} from 'phovea_core/src';


export function getPosXScale(items, totalWidth, padding = 20) {
  const firstTimePoint = moment(items[0].time);
  const lastTimePoint = moment(items[items.length - 1].time);
  const timeRange = lastTimePoint.diff(firstTimePoint, 'days');

  return d3.scale.linear()
    .domain([0, timeRange])
    .range([padding, totalWidth - padding]);
}

export function getTimeScale(items, totalWidth, padding = 20) {
  const firstTimePoint = moment(items[0].time).toDate();
  const lastTimePoint = moment(items[items.length - 1].time).toDate();

  return d3.time.scale()
    .domain([firstTimePoint, lastTimePoint])
    .range([padding, totalWidth - padding]);
}


export function scaleCircles(totalwidth, numberofCircles) {
  //Bigger value means more compressed points on the time line
  const padding = 80;
  //showing only 7 circles on the timeline when no time-object is availiable for the specific dataset
  // in the next step -> implement the feature of a scroll bar showing more data points on the timeline
  // const numberofCircles = 7;
  return (totalwidth - padding) / numberofCircles;
}

let selectedTimePoints = [];

/**
 * Stores a selected time point and sends an event with all stored time points
 * If two time points are stored, the array is cleared
 *
 * @param timepoint
 */
export function selectTimePoint(timepoint) {
  selectedTimePoints.push(timepoint);

  // sort elements by time -> [0] = earlier = source; [1] = later = destination
  selectedTimePoints = selectedTimePoints.sort((a, b) => d3.ascending(a.time, b.time));

  hash.setProp(AppConstants.HASH_PROPS.TIME_POINTS, selectedTimePoints.map((d) => d.key).join(','));

  if(selectedTimePoints.length === 1) {
    hash.removeProp(AppConstants.HASH_PROPS.DETAIL_VIEW); // remove detail view prop
  }

  events.fire(AppConstants.EVENT_TIME_POINTS_SELECTED, selectedTimePoints);

  // clear after 2 selected time points
  if(selectedTimePoints.length === 2) {
    selectedTimePoints = [];
  }
}

/**
 * Filters list of time points from given keys in the URL hash and fires the event
 * @param timepoints
 */
export function selectTimePointFromHash(timepoints) {
  if(hash.has(AppConstants.HASH_PROPS.TIME_POINTS) === false) {
    return;
  }

  const selectedTPKeys:string[] = hash.getProp(AppConstants.HASH_PROPS.TIME_POINTS).split(',');
  const selectedTimePoints = timepoints.filter((d) => selectedTPKeys.indexOf(d.key) > -1);

  selectedTimePoints.forEach((d) => {
    selectTimePoint(d);
  });

  if(selectedTimePoints.length === 2 && hash.getInt(AppConstants.HASH_PROPS.DETAIL_VIEW) === 1) {
    events.fire(AppConstants.EVENT_DATASET_SELECTED_LEFT, selectedTimePoints[0].item);
    events.fire(AppConstants.EVENT_DATASET_SELECTED_RIGHT, selectedTimePoints[1].item);
    events.fire(AppConstants.EVENT_OPEN_DIFF_HEATMAP, selectedTimePoints.map((d) => d.item));
  } else {
    hash.removeProp(AppConstants.HASH_PROPS.DETAIL_VIEW);
  }
}
