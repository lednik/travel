export function debounce<T extends (...args: unknown[]) => unknown>(
    callback: T,
    delay: number
): (...args: Parameters<T>) => void {
    let timeoutId: ReturnType<typeof setTimeout>

    return function (this: ThisParameterType<T>, ...args: Parameters<T>) {
        clearTimeout(timeoutId)

        timeoutId = setTimeout(() => {
            callback.apply(this, args)
        }, delay)
    }
}

export function debouncePromise<T extends (...args: unknown[]) => unknown>(
    callback: T,
    delay: number
    ): (...args: Parameters<T>) => Promise<ReturnType<T>> {
    let timeoutId: ReturnType<typeof setTimeout>

    return function (this: ThisParameterType<T>, ...args: Parameters<T>) {
        clearTimeout(timeoutId)

        return new Promise((resolve) => {
        timeoutId = setTimeout(() => {
            const result = callback.apply(this, args) as ReturnType<T>
            resolve(result)
        }, delay)
        })
    }
}