import { Component, type ReactNode } from 'react'

export class TourBoundary extends Component<{onLoss:()=>void; children:ReactNode}, {failed:boolean}> {
  state = { failed:false }
  static getDerivedStateFromError() { return { failed:true } }
  componentDidCatch() { this.props.onLoss() }
  render() { return this.state.failed ? null : this.props.children }
}
