'use client';

import { FaPlus } from 'react-icons/fa';
import Link from 'next/link';
import Image from 'next/image';
import { StaticImport } from 'next/dist/shared/lib/get-img-props';

interface CardProps {
    image: string | StaticImport;
    description: string;
    title: string;
    subtitle: string;
    page: string;
    button: string;
}

export default function Card({ image, description, title, subtitle, page, button }: CardProps) {

    return (
        <div className="rounded-lg shadow-lg max-w-[350px] mx-auto">
            {image && (
                <Image
                    src={image}
                    alt="Card Image"
                    className="w-full h-[230px] object-cover mb-2"
                />
            )}
            <div className='w-[90%] mx-auto p-4'>
                <h3 className="ml-2 text-xl ">{title}</h3>
                <h3 className="ml-2 text-xl text-petroleumGreen font-bold uppercase">{subtitle}</h3>
                <hr className='my-4 text-gray-200' />
                <p className="">{description}</p>
                <div className="flex justify-center my-4">
                    <Link
                        href={page}
                        className="border-2 text-petroleumGreen border-mintGreen hover:bg-petroleumGreen hover:border-petroleumGreen hover:text-white text-sm font-semibold py-2 px-3 rounded-md flex items-center"
                    >

                        <FaPlus className="size-3 mr-2" />
                        {button}
                    </Link>
                </div>
            </div>
        </div>
    );
}
