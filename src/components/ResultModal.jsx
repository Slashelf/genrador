import React from 'react';
import Icon from './Icon.jsx';

const FILE_LABELS = {
  person: 'Persona',
  celebrity: 'Celebridad',
};

const ResultModal = ({ result, onClose }) => {
  if (!result) {
    return null;
  }

  const style = result.style || {};
  const styleName = style.name || 'Imagen';
  const description = style.description || '';
  const imageEntries = Object.entries(result.images || {}).filter(([, fileName]) => fileName);
  const isVideo = result.media === 'video' || String(result.fileName || '').endsWith('.mp4');

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
      onClick={(e) => e.stopPropagation()}
    >
      <div
        className="bg-white rounded-2xl p-8 max-w-2xl max-h-[90vh] overflow-y-auto mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center mb-6">
          <h3 className="text-3xl font-bold text-green-600 mb-2 flex items-center justify-center gap-2">
            <Icon name={style.icon || 'image'} className="w-7 h-7" />
            {styleName} listo
          </h3>
          <p className="text-gray-600">
            {result.message || (description ? `Tu ${description} ha sido creado` : 'Tu imagen ha sido creada')}
          </p>
          {result.generationTime && (
            <p className="text-sm text-gray-500 mt-2">
              Generado en {result.generationTime} segundos
            </p>
          )}
        </div>

        {(result.thumbUrl || result.imageUrl) && (
          <div className="mb-6">
            {isVideo ? (
              <video
                src={result.imageUrl}
                poster={result.thumbUrl}
                controls
                autoPlay
                playsInline
                className="w-full rounded-xl shadow-lg border-2 border-gray-200"
              />
            ) : (
              <img
                src={result.thumbUrl || result.imageUrl}
                alt="Imagen generada"
                width="640"
                height="640"
                className="w-full rounded-xl shadow-lg border-2 border-gray-200"
              />
            )}
          </div>
        )}

        <div className="space-y-4 mb-6">
          {imageEntries.length > 0 && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-2">Archivos utilizados</h4>
              <div className="text-sm space-y-1">
                {imageEntries.map(([key, fileName]) => (
                  <p key={key}>
                    <strong className="text-primary-700">{FILE_LABELS[key] || key}:</strong> {fileName}
                  </p>
                ))}
              </div>
            </div>
          )}

          {result.data && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">{description || styleName}</h4>
              <div className="text-sm space-y-1">
                {result.data.celebrityName && (
                  <p><strong className="text-blue-700">Celebridad:</strong> {result.data.celebrityName}</p>
                )}
                {result.data.extraDetails && result.data.extraDetails.trim() !== '' && (
                  <p><strong className="text-blue-700">Detalles:</strong> {result.data.extraDetails}</p>
                )}
              </div>
            </div>
          )}

          {result.prompt && (
            <div className="bg-purple-50 p-4 rounded-lg">
              <h4 className="font-semibold text-purple-800 mb-2">Prompt usado</h4>
              <p className="text-sm text-purple-700 italic">{result.prompt}</p>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClose();
            }}
            className="flex-1 bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors font-medium"
          >
            Cerrar
          </button>

          {result.imageUrl && (
            <a
              href={result.imageUrl}
              download={result.fileName || 'imagen.png'}
              className="flex-1 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors font-medium text-center"
            >
              {isVideo ? 'Descargar video' : 'Descargar imagen'}
            </a>
          )}

          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              window.location.href = '/gallery';
            }}
            className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            Ver galería
          </button>

          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClose();
              setTimeout(() => {
                window.location.reload();
              }, 100);
            }}
            className="flex-1 bg-secondary-500 text-white px-6 py-3 rounded-lg hover:bg-secondary-600 transition-colors font-medium"
          >
            Generar otra
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultModal;
