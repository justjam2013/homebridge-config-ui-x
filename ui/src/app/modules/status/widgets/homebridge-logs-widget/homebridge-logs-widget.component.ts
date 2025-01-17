import { NgClass, NgStyle } from '@angular/common'
import { Component, ElementRef, inject, Input, OnDestroy, OnInit, viewChild } from '@angular/core'
import { TranslatePipe } from '@ngx-translate/core'
import { Subject } from 'rxjs'
import { ITerminalOptions } from 'xterm'

import { LogService } from '@/app/core/log.service'

@Component({
  templateUrl: './homebridge-logs-widget.component.html',
  standalone: true,
  imports: [
    NgClass,
    NgStyle,
    TranslatePipe,
  ],
})
export class HomebridgeLogsWidgetComponent implements OnInit, OnDestroy {
  private $log = inject(LogService)

  readonly widgetContainerElement = viewChild<ElementRef>('widgetcontainer')
  readonly titleElement = viewChild<ElementRef>('terminaltitle')
  readonly termTarget = viewChild<ElementRef>('logoutput')

  @Input() widget: any
  @Input() resizeEvent: Subject<any>
  @Input() configureEvent: Subject<any>

  public terminalHeight = 200

  private fontSize = 15
  private fontWeight: ITerminalOptions['fontWeight'] = '400'

  constructor() {}

  ngOnInit() {
    this.fontSize = this.widget.fontSize || 15
    this.fontWeight = this.widget.fontWeight || 400

    setTimeout(() => {
      this.$log.startTerminal(this.termTarget(), {
        cursorBlink: false,
        theme: {
          background: '#2b2b2b',
        },
        fontSize: this.fontSize,
        fontWeight: this.fontWeight,
      }, this.resizeEvent)
    })

    this.resizeEvent.subscribe({
      next: () => {
        this.terminalHeight = this.getTerminalHeight()
      },
    })

    this.configureEvent.subscribe({
      next: () => {
        if (this.widget.fontSize !== this.fontSize || this.widget.fontWeight !== this.fontWeight) {
          this.fontSize = this.widget.fontSize
          this.fontWeight = this.widget.fontWeight
          this.$log.term.options.fontSize = this.widget.fontSize
          this.$log.term.options.fontWeight = this.widget.fontWeight
          this.resizeEvent.next(undefined)
          setTimeout(() => {
            this.$log.term.scrollToBottom()
          }, 100)
        }
      },
    })
  }

  getTerminalHeight(): number {
    const widgetContainerHeight = (this.widgetContainerElement().nativeElement as HTMLElement).offsetHeight
    const titleHeight = (this.titleElement().nativeElement as HTMLElement).offsetHeight
    return widgetContainerHeight - titleHeight
  }

  ngOnDestroy() {
    this.$log.destroyTerminal()
  }
}
