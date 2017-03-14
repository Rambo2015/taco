/**
 * Created by Holger Stitz on 29.08.2016.
 */

import * as moment from 'moment';
import * as d3 from 'd3';
import * as $ from 'jquery';
import * as events from 'phovea_core/src/event';
import {AppConstants} from './app_constants';
import {IAppView} from './app';
import {getTimeScale} from './util';

/**
 * Shows a timeline with all available data points for a selected data set
 */
class Timeline implements IAppView {

  private $node;
  private $svgTimeline;

  private items;

  // Width of the timeline div element
  private totalWidth: number;
  private timelineWidth = $(window).innerWidth();
  private timelineHeight = 25;
  private toggledElements: boolean;

  // Helper variable for the clicking event
  private isClicked: number = 0;

  /**
   * Constructor method for the Timeline class which creates the timeline on the given parent element.
   * Including eventual options if supplied.
   * @param parent element on which the timeline element is created
   * @param options optional options for the timeline element
   */
  constructor(parent:Element, private options:any) {
    this.$node = d3.select(parent).append('div').classed('timeline', true);
  }

  /**
   * Initialize the view and return a promise
   * that is resolved as soon the view is completely initialized.
   * @returns {Promise<Timeline>}
   */
  init() {
    this.toggledElements = false;
    this.build();
    this.attachListener();

    // Return the promise directly as long there is no dynamical data to update
    return Promise.resolve(this);
  }

  /**
   * Attach event handler for broadcasted events
   */
  private attachListener() {
    events.on(AppConstants.EVENT_DATA_COLLECTION_SELECTED, (evt, items) => {
     this.updateItems(items);
    });
    // Call the resize function whenever a resize event occurs
    d3.select(window).on('resize', () => this.resize());
  }

  /**
   * Build the basic DOM elements like the svg graph and appends the tooltip div.
   */
  private build() {
    this.$svgTimeline = this.$node
      .append('svg')
      .attr('width', this.timelineWidth)
      .attr('height', this.timelineHeight);
  }

  /**
   * This method updates the graph and the timeline based on the window size and resizes the whole page.
   */
  private resize() {
    this.totalWidth = $(this.$node.node()).width();
    this.$svgTimeline.attr('width', this.totalWidth);
    this.updateTimelineAxis(this.$svgTimeline.select('g.axis.x'));
  }

  /**
   * This method handles the update for a new dataset or changed dataset.
   * @param items The new items which should be displayed.
   */

  private updateItems(items) {
    // Store new items in class variable
    this.items = items;

    // Delete all existing DOM elements
    this.$svgTimeline.selectAll('*').remove();
    this.resize();
    this.drawTimeline();
  }


  /**
   * This method draws the timeline and also adds the circles.
   * It also handles the click and mouseover events for showing further context.
   */
  private drawTimeline() {
    const that = this;
    let clickedElement = [];

    const $xAxis = this.$svgTimeline.append('g')
      .attr('class', 'x axis')
      .attr('transform', 'translate(0, 0)');

    this.updateTimelineAxis($xAxis);

    // Append the circles and add the mouseover and click listeners
    $xAxis.selectAll('.tick text')
      .on('click', function (date:Date) {
        const found = that.items.filter((item) => item.time.isSame(date, 'year'));
        const d = found[0];
        (<MouseEvent>d3.event).preventDefault();

        if (that.isClicked === 0) {
          // Toggle the active CSS classes
          that.$svgTimeline.selectAll('text').classed('active', false);
          //Enable the active class only on clicked circle
          d3.select(this).classed('active', true).attr('fill');

          clickedElement.push(d);
          that.isClicked = 1;

          events.fire(AppConstants.EVENT_TIME_POINTS_SELECTED, []);

        } else {
          d3.select(this).classed('active', true).attr('fill');
          clickedElement.push(d);

          // sort elements by time -> [0] = earlier = source; [1] = later = destination
          const sortedItems = clickedElement.sort((a, b) => d3.ascending(a.time, b.time));

          //Only perform events and open Histogram if it is not open already
          events.fire(AppConstants.EVENT_TIME_POINTS_SELECTED, sortedItems);
          d3.select('#detailViewBtn').attr('disabled', null);

          that.isClicked = 0;
          clickedElement = [];
        }
      });
  }

  private updateTimelineAxis($node) {
    const timeScale = getTimeScale(this.items, this.totalWidth);
    const xAxis = d3.svg.axis()
      .scale(timeScale)
      .ticks(d3.time.years, 1)
      .tickFormat(d3.time.format('%Y'))
      .tickPadding(8);

    const $xAxis = $node.call(xAxis);

    $xAxis.selectAll('.tick')
      .filter((d) => {
        const found = this.items.filter((item) => item.time.isSame(d, 'year'));
        return (found.length === 0);
      })
      .remove();

    return $xAxis;
  }
}

/**
 * Factory method to create a new Timeline instance.
 * @param parent Element on which the timeline is drawn
 * @param options Parameters for the instance (optional)
 * @returns {Timeline}
 */
export function create(parent: Element, options: any) {
  return new Timeline(parent, options);
}
