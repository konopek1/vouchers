export default interface Comparable<T> {
    compare: (x: T) => boolean
}