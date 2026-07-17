// 分板块错误边界（架构 §4.2 / SPEC-N-07）：局部捕获，不整页白屏
import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // 仅本地记录；无外部上报（隐私 SPEC-N-03）。
    console.error('板块运行时异常：', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="rounded-xl border border-accent-red/40 bg-bg-panel/70 p-6 text-center">
          <p className="text-accent-red">该板块暂时出现问题</p>
          <button
            className="mt-3 rounded-lg border border-gold/50 px-4 py-1.5 text-sm text-gold hover:bg-gold/10"
            onClick={() => this.setState({ hasError: false })}
          >
            重试
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
