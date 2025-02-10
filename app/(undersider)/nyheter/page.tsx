/**
 * @file: page.tsx
 * @description: Nyhetsside for DiskGolf 
 * @author: Maria
 * Inspirasjon fra: https://zensykkel.no/blogs/blogg-nyheter?page=3&srsltid=AfmBOopyYXqbkbXWoVO-VkpoglhhaqCefdeCnUbzGZ-6-zKLo0JJSELY
 */

"use client";
import React from 'react';
import Image from 'next/image';

function page() {
  const newsItems = [
    {
      title: "Vi er snart i App-store og Google Play!",
      content: <>
        <p className="text-gray-600 mb-4">
          Vi gleder oss til å starte sesongen 2025 med dere! 
        </p>
      </>,
      image: "/nyheter/image3.jpg"
    },
    {
      title: "Ta vare på Disk Golf utstyret ditt i vinter",
      content: <>
        <p className="text-gray-600 mb-4">
          Husk å rengjøre diskene dine med litt såpevann og en klut, og tørre dem godt før du lagrer dem et tørt sted med stabil temperatur 
          Sjekk bagen, skoene og annet utstyr for skader, og vurder om du skal reparere eller kjøpe nytt til neste sesong.
        </p>
      </>,
      image: "/nyheter/image2.jpg"
    },
    {
      title: "September og vi er her!",
      content: <>
        <p className="text-gray-600 mb-4">
          Vi er en ny app for deg som spiller Disk Golf! Følg med på våre nettsider for lanseringsdato. 
        </p>
      </>,
      image: "/nyheter/image1.jpg"
    }
  ];

  return (
    <main className="flex-grow p-6 bg-white">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center text-black">Nyheter</h1>
        
        <div className="grid gap-8">
          {newsItems.map((item, index) => (
            <article 
              key={index} 
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
            >
              <div className="flex flex-col gap-4">
                {/* Image container with hover effect */}
                <div className="w-full overflow-hidden rounded-md">
                  <Image
                    src={item.image}
                    alt={item.title}
                    width={800}
                    height={400}
                    className="w-full h-[300px] object-cover rounded-md transition-transform duration-300 hover:scale-105"
                  />
                </div>
                
                {/* Content container */}
                <div className="w-full">
                  <h2 className="text-2xl font-semibold mb-4 hover:text-green-600 cursor-pointer text-black">
                    {item.title}
                  </h2>
                  {item.content}
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="flex justify-center mt-8 gap-4">
          <button className="px-4 py-2 border rounded bg-green-600 text-white">1</button>
        </div>
      </div>
    </main>
  )
}

export default page