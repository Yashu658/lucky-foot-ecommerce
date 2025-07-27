import { useState,useEffect } from "react";
import { FiPlus, FiTrash2 } from "react-icons/fi";

const DescriptionEditor = ({ formData, setFormData }) => {
  const [description, setDescription] = useState({
    overview: "",
    features: [""],
    specifications: [{ name: "", value: "" }],
    careInstructions: "",
    materialComposition: "",
    additionalInfo:  [""],
  });

  useEffect(() => {
  try {
   let initial = {};

if (typeof formData.description === "string" && formData.description.trim()) {
  try {
    initial = JSON.parse(formData.description);
  } catch (error) {
    console.error("Error parsing description:", error);
    initial = {}; // fallback
  }
} else if (typeof formData.description === "object" && formData.description) {
  initial = formData.description;
}


  setDescription({
  overview: initial.overview || "",
  features: Array.isArray(initial.features) ? initial.features : [""],
  specifications: Array.isArray(initial.specifications) ? initial.specifications : [{ name: "", value: "" }],
  careInstructions: initial.careInstructions || "",
  materialComposition: initial.materialComposition || "",
  additionalInfo: Array.isArray(initial.additionalInfo)
    ? initial.additionalInfo
    : (initial.additionalInfo ? [initial.additionalInfo] : [""]),
});

  } catch (error) {
    console.error("Error descriptioneditor product:", error);
  }
}, [formData.description]);


  // Helper to sync updated description to formData
  const updateFormData = (newDescription) => {
    setFormData((prev) => ({
      ...prev,
      description: JSON.stringify(newDescription)
    }));
  };
  
  const handleDescriptionChange = (field, value) => {
    const updated = { ...description, [field]: value };
    setDescription(updated);
    updateFormData(updated);
  };

  const handleAdditionalInfoChange = (index, value) => {
  const additionalInfo = [...description.additionalInfo];
  additionalInfo[index] = value;
  const updated = { ...description, additionalInfo };
  setDescription(updated);
  updateFormData(updated);
};

const addAdditionalInfo = () => {
  const updated = {
    ...description,
    additionalInfo: [...description.additionalInfo, ""],
  };
  setDescription(updated);
  updateFormData(updated);
};

const removeAdditionalInfo = (index) => {
  const additionalInfo = description.additionalInfo.filter((_, i) => i !== index);
  const updated = { ...description, additionalInfo };
  setDescription(updated);
  updateFormData(updated);
};


    const handleFeatureChange = (index, value) => {
    const features = [...description.features];
    features[index] = value;
    const updated = { ...description, features };
    setDescription(updated);
    updateFormData(updated);
  };

  const addFeature = () => {
    const updated = {
      ...description,
      features: [...description.features, ""]
    };
    setDescription(updated);
    updateFormData(updated);
  };

   const addSpecification = () => {
    const updated = {
      ...description,
      specifications: [...description.specifications, { name: "", value: "" }]
    };
    setDescription(updated);
    updateFormData(updated);
  };

   const removeFeature = (index) => {
    const features = description.features.filter((_, i) => i !== index);
    const updated = { ...description, features };
    setDescription(updated);
    updateFormData(updated);
  };

  const handleSpecChange = (index, field, value) => {
    const specifications = [...description.specifications];
    specifications[index] = { ...specifications[index], [field]: value };
    const updated = { ...description, specifications };
    setDescription(updated);
    updateFormData(updated);
  };
 

  const removeSpecification = (index) => {
    const specifications = description.specifications.filter((_, i) => i !== index);
    const updated = { ...description, specifications };
    setDescription(updated);
    updateFormData(updated);
  };


   return (
    <div className="space-y-6">
      {/* Overview */}
      <div>
        <label className="block text-sm font-medium text-gray-800 mb-1">
          Product Overview
        </label>
        <textarea
          value={description.overview}
          onChange={(e) => handleDescriptionChange("overview", e.target.value)}
          rows="4"
          className="w-full border border-gray-700 rounded-lg p-2 text-gray-900"
          placeholder="Brief description of the product"
          required
        />
      </div>

      {/* Features */}
      <div>
        <label className="block text-sm font-medium text-gray-800 mb-1">
          Key Features
        </label>
        {description.features.map((feature, index) => (
          <div key={index} className="flex gap-2 mb-2 items-center">
            <input
              type="text"
              value={feature}
              onChange={(e) => handleFeatureChange(index, e.target.value)}
              className="flex-1 border border-gray-700 rounded-lg p-2 text-gray-900"
              placeholder="Feature"
            />
            {description.features.length > 1 && (
              <button
                type="button"
                onClick={() => removeFeature(index)}
                className="p-2 text-red-600 hover:bg-red-100 rounded"
              >
                <FiTrash2 />
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={addFeature}
          className="mt-2 flex items-center gap-1 text-blue-600 hover:text-blue-800"
        >
          <FiPlus /> Add Feature
        </button>
      </div>

      {/* Specifications */}
      <div>
        <label className="block text-sm font-medium text-gray-800 mb-1">
          Specifications
        </label>
        {description.specifications.map((spec, index) => (
          <div key={index} className="grid grid-cols-5 gap-2 mb-2">
            <input
              type="text"
              value={spec.name}
              onChange={(e) => handleSpecChange(index, "name", e.target.value)}
              className="col-span-2 border border-gray-700 rounded-lg p-2 text-gray-900"
              placeholder="Specification name"
            />
            <input
              type="text"
              value={spec.value}
              onChange={(e) => handleSpecChange(index, "value", e.target.value)}
              className="col-span-2 border border-gray-700 rounded-lg p-2 text-gray-900"
              placeholder="Specification value"
            />
            {description.specifications.length > 1 && (
              <button
                type="button"
                onClick={() => removeSpecification(index)}
                className="p-2 text-red-600 hover:bg-red-100 rounded"
              >
                <FiTrash2 />
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={addSpecification}
          className="mt-2 flex items-center gap-1 text-blue-600 hover:text-blue-800"
        >
          <FiPlus /> Add Specification
        </button>
      </div>

      {/* Material Composition */}
      <div>
        <label className="block text-sm font-medium text-gray-800 mb-1">
          Material Composition
        </label>
        <input
          type="text"
          value={description.materialComposition}
          onChange={(e) =>
            handleDescriptionChange("materialComposition", e.target.value)
          }
          className="w-full border border-gray-700 rounded-lg p-2 text-gray-900"
          placeholder="E.g., 100% Cotton, Rubber sole, etc."
        />
      </div>

      {/* Care Instructions */}
      <div>
        <label className="block text-sm font-medium text-gray-800 mb-1">
          Care Instructions
        </label>
        <textarea
          value={description.careInstructions}
          onChange={(e) => handleDescriptionChange("careInstructions", e.target.value)}
          rows="2"
          className="w-full border border-gray-700 rounded-lg p-2 text-gray-900"
          placeholder="How to care for this product"
        />
      </div>

     {/* Additional Info */}
<div>
  <label className="block text-sm font-medium text-gray-800 mb-1">
    Additional Information
  </label>
  {description.additionalInfo.map((info, index) => (
    <div key={index} className="flex gap-2 mb-2 items-center">
      <input
        type="text"
        value={info}
        onChange={(e) => handleAdditionalInfoChange(index, e.target.value)}
        className="flex-1 border border-gray-700 rounded-lg p-2 text-gray-900"
        placeholder="Additional info"
        required={index === 0}
      />
      {description.additionalInfo.length > 1 && (
        <button
          type="button"
          onClick={() => removeAdditionalInfo(index)}
          className="p-2 text-red-600 hover:bg-red-100 rounded"
        >
          <FiTrash2 />
        </button>
      )}
    </div>
  ))}
  <button
    type="button"
    onClick={addAdditionalInfo}
    className="mt-2 flex items-center gap-1 text-blue-600 hover:text-blue-800"
  >
    <FiPlus /> Add Additional Info
  </button>
</div>

    </div>
  );
};

export default DescriptionEditor;