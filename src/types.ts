export interface Comment {
  text: string
  mode?: 'ltr' | 'rtl' | 'top' | 'bottom'
  /**
   * Specified in seconds. Not required in live mode.
   * @default media?.currentTime
   */
  time?: number
  style?: Partial<CSSStyleDeclaration>
  /**
   * A custom render to draw comment.
   * When it exist, `text` and `style` will be ignored.
   */
  render?(): HTMLElement
}

export interface DanmakuOption {
  /**
   * The stage to display comments will be appended to container.
   */
  container: HTMLElement
  /**
   * If it's not provided, Danmaku will be in live mode.
   */
  media?: HTMLMediaElement
  /**
   * Preseted comments, used in media mode
   */
  comments?: Comment[]
  /**
   * The speed of comments in `ltr` and `rtl` mode.
   */
  speed?: number
  /**
   * The opacity of comments.
   */
  opacity?: number
}
