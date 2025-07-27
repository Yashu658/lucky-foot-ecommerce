import React from 'react'

const ProductDescription =({ description })=> {
 if (typeof description === 'string') {
    return (
      <div>
        <h3 className="text-lg font-semibold mb-2">Product Description</h3>
        <p className="text-gray-700">{description}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {description.overview && (
        <div>
          <h3 className="text-lg font-semibold mb-2">Product Overview</h3>
          <p className="text-gray-700">{description.overview}</p>
        </div>
      )}

      {description.features && description.features.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-2">Key Features</h3>
          <ul className="list-disc pl-5 space-y-1">
            {description.features.map((feature, index) => (
              <li key={index} className="text-gray-700">
                {feature}
              </li>
            ))}
          </ul>
        </div>
      )}

      {description.specifications && description.specifications.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-2">Specifications</h3>
          <table className="w-full">
            <tbody>
              {description.specifications.map((spec, index) => (
                <tr key={index} className="border-b border-gray-200 grid">
                  <td className="py-2 font-medium text-gray-700">{spec.name}</td>
                  <td className="py-2 font-medium text-gray-700">{spec.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {description.materialComposition && (
        <div>
          <h3 className="text-lg font-semibold mb-2">Material Composition</h3>
          <p className="text-gray-700">{description.materialComposition}</p>
        </div>
      )}

      {description.careInstructions && (
        <div>
          <h3 className="text-lg font-semibold mb-2">Care Instructions</h3>
          <p className="text-gray-700">{description.careInstructions}</p>
        </div>
      )}

      {description.additionalInfo && description.additionalInfo.length > 0 && (
  <div>
    <h3 className="text-lg font-semibold mb-2">Additional Information</h3>
    <ul className="list-disc pl-5 space-y-1">
      {description.additionalInfo.map((info, index) => (
        <li key={index} className="text-gray-700">
          {info}
        </li>
      ))}
    </ul>
  </div>
)}

    </div>
  )
}

export default ProductDescription