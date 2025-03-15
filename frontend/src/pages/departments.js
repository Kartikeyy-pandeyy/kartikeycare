import React, { useState, useEffect } from "react";
import Layout from "../components/layout";
import "../style/departments.css";
import BookingForm from "../components/booking";

const departmentsData = [
  { name: "Anesthesiology", description: "Pain relief, surgical anesthesia, and critical care management" },
  { name: "Bariatrics", description: "Obesity treatment, weight-loss surgery, and metabolic disorder care" },
  { name: "Cardiology", description: "Heart disease prevention, diagnostics, and advanced cardiac treatments" },
  { name: "Cardiothoracic Surgery", description: "Surgical interventions for heart, lungs, and chest conditions" },
  { name: "Dentistry", description: "Oral health, dental care, orthodontics, and cosmetic dentistry" },
  { name: "Dermatology", description: "Skin health, cosmetic treatments, laser therapy, and dermatologic surgery" },
  { name: "Diabetology", description: "Diabetes management, endocrine disorders, and metabolic health" },
  { name: "Endocrinology", description: "Hormonal disorders, thyroid care, adrenal, and metabolic diseases" },
  { name: "ENT (Otolaryngology)", description: "Ear, nose, throat care, sinus surgery, and audiology services" },
  { name: "Gastroenterology", description: "Digestive disorders, liver diseases, colonoscopy, and endoscopic procedures" },
  { name: "General Medicine", description: "Primary healthcare, internal medicine, and chronic disease management" },
  { name: "General Surgery", description: "Surgical procedures for abdominal, hernia, and emergency conditions" },
  { name: "Geriatrics", description: "Elderly care, age-related diseases, and palliative treatments" },
  { name: "Gynecology", description: "Women’s reproductive health, pregnancy care, and fertility treatments" },
  { name: "Hematology", description: "Blood disorders, leukemia, hemophilia, and clotting diseases" },
  { name: "Hepatology", description: "Liver diseases, hepatitis management, and liver transplant care" },
  { name: "Infectious Diseases", description: "Diagnosis and treatment of bacterial, viral, and parasitic infections" },
  { name: "Nephrology", description: "Kidney diseases, dialysis treatment, and renal transplant care" },
  { name: "Neurology", description: "Brain disorders, stroke care, epilepsy, and nervous system diseases" },
  { name: "Neurosurgery", description: "Brain surgery, spinal cord procedures, and neurosurgical emergencies" },
  { name: "Oncology", description: "Cancer diagnosis, chemotherapy, radiotherapy, and immunotherapy treatments" },
  { name: "Ophthalmology", description: "Eye care, vision correction, cataract surgery, and retina treatments" },
  { name: "Orthopedics", description: "Bone fractures, joint replacements, and musculoskeletal disorders" },
  { name: "Pathology", description: "Lab testing, biopsy analysis, and disease diagnosis through specimens" },
  { name: "Pediatrics", description: "Child healthcare, vaccinations, and developmental disorder treatments" },
  { name: "Pharmacy", description: "Prescription medicines, drug therapy, and pharmaceutical consultations" },
  { name: "Plastic Surgery", description: "Reconstructive surgery, aesthetic procedures, and burn treatments" },
  { name: "Psychiatry", description: "Mental health disorders, therapy, counseling, and rehabilitation" },
  { name: "Pulmonology", description: "Lung diseases, respiratory therapy, and COPD, asthma management" },
  { name: "Radiology", description: "Medical imaging, CT scans, MRI, ultrasound, and X-ray diagnostics" },
  { name: "Rheumatology", description: "Arthritis, autoimmune diseases, and connective tissue disorders" },
  { name: "Sports Medicine", description: "Injury rehabilitation, athletic performance, and physiotherapy" },
  { name: "Thoracic Surgery", description: "Surgical treatment for lungs, esophagus, and chest cavity issues" },
  { name: "Toxicology", description: "Poisoning management, drug overdose, and chemical exposure treatments" },
  { name: "Transplant Surgery", description: "Organ transplantation, donor matching, and post-surgical care" },
  { name: "Trauma and Emergency", description: "Emergency medical care, accident injuries, and urgent surgery" },
  { name: "Urology", description: "Kidney stones, urinary tract infections, and male reproductive health" },
  { name: "Vascular Surgery", description: "Blood vessel diseases, varicose vein treatment, and aneurysms" },
  { name: "Venereology", description: "Sexually transmitted infections (STIs) and reproductive health treatments" }
];

const Departments = () => {
  const [search, setSearch] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState(null);

  useEffect(() => {
    setSelectedDepartment(departmentsData[0]); // Default to first department
  }, []);

  const handleDepartmentClick = (department) => {
    setSelectedDepartment(department);
    document.getElementById("booking-form").scrollIntoView({ behavior: "smooth" });
  };

  return (
    <Layout>
      <div className="departments-page">
        <h2 className="departments-title">Our Departments</h2>
        <input
          type="text"
          placeholder="Search departments..."
          className="search-bar"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="departments-grid">
          {departmentsData
            .filter((dept) =>
              dept.name.toLowerCase().includes(search.toLowerCase()) ||
              dept.description.toLowerCase().includes(search.toLowerCase())
            )
            .map((dept, index) => (
              <div
                key={index}
                className={`department-card ${selectedDepartment?.name === dept.name ? "selected" : ""}`}
                onClick={() => handleDepartmentClick(dept)}
                style={{ "--index": index }}
              >
                <h3 className="department-title">{dept.name}</h3>
                <p className="department-description">{dept.description}</p>
              </div>
            ))}
        </div>
        <div id="booking-form" className="booking-form-section">
          {selectedDepartment && <BookingForm selectedDepartment={selectedDepartment.name} />}
        </div>
      </div>
    </Layout>
  );
};

export default Departments;