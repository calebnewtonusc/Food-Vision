import React from 'react';

function DemoGallery({ onSelectDemo }) {
  const demoImages = [
    {
      id: 'pizza',
      name: 'Pizza',
      emoji: '􀬊',
      description: 'Classic Italian pizza',
      url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&q=80'
    },
    {
      id: 'steak',
      name: 'Steak',
      emoji: '􀲃',
      description: 'Juicy grilled steak',
      url: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=600&q=80'
    },
    {
      id: 'sushi',
      name: 'Sushi',
      emoji: '􀲁',
      description: 'Fresh Japanese sushi',
      url: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=600&q=80'
    }
  ];

  const handleDemoClick = async (demo) => {
    try {
      // Fetch the demo image
      const response = await fetch(demo.url);
      const blob = await response.blob();

      // Convert blob to File object
      const file = new File([blob], `${demo.id}.jpg`, { type: 'image/jpeg' });

      // Pass to parent component
      onSelectDemo(file);
    } catch (error) {
      console.error('Failed to load demo image:', error);
      alert('Failed to load demo image. Please try uploading your own image.');
    }
  };

  return (
    <div id="demo">
      <div className="grid grid-cols-1 gap-6">
        {demoImages.map((demo) => (
          <button
            key={demo.id}
            onClick={() => handleDemoClick(demo)}
            className="rounded-lg shadow-md hover:shadow-lg transition-all overflow-hidden group hover:scale-105 transform h-24"
          >
            <img
              src={demo.url}
              alt={demo.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
          </button>
        ))}
      </div>
    </div>
  );
}

export default DemoGallery;
