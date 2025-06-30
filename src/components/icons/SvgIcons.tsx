import React from "react"


export const CrossIcon: React.FC = ({ fill, ...props }: any) => {
    return (
        <svg
            {...props}
            width='14'
            height='14'
            viewBox='0 0 14 14'
            fill='none'
            xmlns='http://www.w3.org/2000/svg'
        >
            <path
                d='M13 1L1 13M1 1L13 13'
                stroke={fill || '#6A7883'}
                strokeWidth='1.5'
                strokeLinecap='round'
                strokeLinejoin='round'
            />
        </svg>
    )
}

export const UploadIcon = ({ fill }: any) => {
    return (
        <svg
            width='20'
            height='17'
            viewBox='0 0 20 17'
            fill='none'
            xmlns='http://www.w3.org/2000/svg'
        >
            <path
                d='M6.66669 11.7723L10 8.43896M10 8.43896L13.3334 11.7723M10 8.43896V15.939M16.6667 12.3913C17.6846 11.5507 18.3334 10.2789 18.3334 8.85563C18.3334 6.32433 16.2813 4.2723 13.75 4.2723C13.5679 4.2723 13.3976 4.17729 13.3051 4.02041C12.2184 2.17633 10.212 0.938965 7.91669 0.938965C4.46491 0.938965 1.66669 3.73719 1.66669 7.18896C1.66669 8.91072 2.36289 10.4699 3.48914 11.6002'
                stroke={fill || '#475467'}
                strokeWidth='1.66667'
                strokeLinecap='round'
                strokeLinejoin='round'
            />
        </svg>
    )
}