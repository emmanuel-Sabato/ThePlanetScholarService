import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Check, Upload, ChevronLeft, Save, Info, Camera, Globe, MapPin, User, Heart, Languages, Mail, Phone, CreditCard, Plus, Trash2, Edit3, Diamond, AlertTriangle, Loader2, FileText, X, Download } from 'lucide-react'
import { useToast } from '../context/ToastContext'
import DashboardNavbar from '../components/DashboardNavbar'
import { COUNTRIES, NATIONALITIES, LANGUAGES, RELATIONSHIPS, OCCUPATIONS, INDUSTRY_TYPES } from '../utils/constants'

const API_URL = import.meta.env.VITE_API_URL ||
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:3000/api'
        : 'https://backend-tau-lime-64.vercel.app/api');

export default function ApplicationFormPage() {
    const { id: applicationId } = useParams()
    const navigate = useNavigate()
    const { showToast } = useToast()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [application, setApplication] = useState(null)
    const [scholarships, setScholarships] = useState([]) // [NEW] Store scholarships
    const fileInputRef = useRef(null)
    const [uploadingStatus, setUploadingStatus] = useState({}) // [NEW] Track upload progress for files
    const [showDocPreviewModal, setShowDocPreviewModal] = useState(false)
    const [previewDocUrl, setPreviewDocUrl] = useState('')

    const [activeMainTab, setActiveMainTab] = useState(1)

    const MAIN_TABS = [
        { id: 1, label: '1.基本信息', subLabel: 'Basic Information' },
        { id: 2, label: '2.申请信息', subLabel: 'Application information' },
        { id: 3, label: '3.申请材料', subLabel: 'Documents' },
        { id: 4, label: '4.补充信息', subLabel: 'More information' },
        { id: 5, label: '5.预览及提交', subLabel: 'Preview' }
    ]

    const TAB1_SUB_TABS = [
        { id: 'personal', label: '个人基本信息', subLabel: 'Personal Information' },
        { id: 'correspondence', label: '通讯地址', subLabel: 'Correspondence Address' },
        { id: 'mailing', label: '通知书邮寄地址', subLabel: 'Mailing Address for Admission Notice' },
        { id: 'passport', label: '证照信息', subLabel: 'Passport and Visa Information' },
        { id: 'learning', label: '在华学习经历', subLabel: 'Learning Experience In China' },
        { id: 'sponsor', label: '经济担保人信息', subLabel: 'Financial Sponsor\'s Information' },
        { id: 'guarantor', label: '事务担保人信息', subLabel: 'Guarantor\'s Information' },
        { id: 'emergency', label: '紧急联系人', subLabel: 'Emergency Contact' }
    ]

    const TAB2_SUB_TABS = [
        { id: 'major', label: '学习专业', subLabel: 'Major\'s Information' },
        { id: 'referee', label: '推荐人信息', subLabel: 'Referee Information' },
        { id: 'language', label: '语言能力', subLabel: 'Language Proficiency' },
        { id: 'education', label: '教育背景', subLabel: 'Education Background' },
        { id: 'work', label: '工作经历', subLabel: 'Work Experience' },
        { id: 'family', label: '家庭成员信息', subLabel: 'Family Members' }
    ]

    const TAB4_SUB_TABS = [
        { id: 'video', label: '申请人视频', subLabel: "Applicant's Video" },
        { id: 'nationality', label: '国籍背景申报', subLabel: 'Nationality Background Declaration' },
        { id: 'awards', label: '奖励信息', subLabel: 'Award Information' },
        { id: 'guardian', label: '监护人信息', subLabel: 'Guardian Information' },
        { id: 'otherInfo', label: '其它信息', subLabel: 'Other Information' },
        { id: 'applicationNote', label: '申请备注', subLabel: 'Application Note' }
    ]

    // Simple validation status check
    const checkSectionStatus = (sectionId, data) => {
        switch (sectionId) {
            // Tab 1 Sections
            case 'personal':
                return data.passportFamilyName && data.givenName && data.gender && data.dob && data.nationality ? 'complete' : 'incomplete'
            case 'correspondence':
                return data.homeDetailedAddress && data.homeCountry && data.homePhone ? 'complete' : 'incomplete'
            case 'mailing':
                return data.mailingReceiverName || data.mailingSyncOption !== 'None' ? 'complete' : 'incomplete'
            case 'passport':
                return data.passportNo && data.passportExpiryDate ? 'complete' : 'incomplete'
            case 'learning':
                return data.hasStudiedInChina ? 'complete' : 'incomplete'
            case 'sponsor':
                return data.financialSponsors?.length > 0 ? 'complete' : 'incomplete'
            case 'guarantor':
                return data.guarantors?.length > 0 ? 'complete' : 'incomplete'
            case 'emergency':
                return data.emergencyContacts?.length > 0 ? 'complete' : 'incomplete'

            // Tab 2 Sections
            case 'major':
                return data.majorCourse && data.referenceType && data.applyForScholarship ? 'complete' : 'incomplete'
            case 'referee':
                return data.referees?.length > 0 ? 'complete' : 'incomplete'
            case 'language':
                return data.englishProficiency ? 'complete' : 'incomplete'
            case 'education':
                return data.educations?.length > 0 ? 'complete' : 'incomplete'
            case 'work':
                return data.workExperiences?.length > 0 ? 'complete' : 'incomplete'
            case 'family':
                return data.familyMembers?.length > 0 ? 'complete' : 'incomplete'

            // Tab 4 Sections
            case 'video':
                return data.moreInfo.video ? 'complete' : 'incomplete'
            case 'nationality':
                return data.moreInfo.isImmigrant && data.moreInfo.hasChineseParent ? 'complete' : 'incomplete'
            case 'awards':
                return data.moreInfo.awards?.length > 0 ? 'complete' : 'incomplete'
            case 'guardian':
                // Check if guardian is needed (not implemented here, assuming optional or always required check?)
                return data.moreInfo.guardians?.length > 0 ? 'complete' : 'incomplete'
            case 'otherInfo':
                // Check basic constraints
                return data.moreInfo.otherInfo?.cscNo || data.moreInfo.otherInfo?.hobbies ? 'complete' : 'incomplete'
            case 'applicationNote':
                return 'complete' // Optional field, always mark complete or incomplete based on content? Let's say complete for now as it's optional.

            default:
                return 'incomplete'
        }
    }

    const [formData, setFormData] = useState({
        // Section 1: Personal Information
        passportFamilyName: '',
        givenName: '',
        fullNameOnPassport: '',
        gender: '',
        nationality: '',
        dob: '',
        birthCountry: '',
        maritalStatus: '',
        religion: '',
        nativeLanguage: '',
        isFamilyNameEmpty: false,
        isGivenNameEmpty: false,
        chineseName: '',
        occupation: '',
        yearsOfLivingInHomeCountry: '',
        wechat: '',
        skype: '',
        isChineseDescent: 'No',
        employerOrInstitution: '',
        photo: null,

        // Section 2: Correspondence Address
        homeDetailedAddress: '',
        homeCityProvince: '',
        homeCountry: '',
        homeZipcode: '',
        homePhone: '',
        homeMainEmail: '',

        currentDetailedAddress: '',
        currentCityProvince: '',
        currentCountry: '',
        currentZipcode: '',
        currentPhone: '',
        currentEmail: '',
        isCurrentSameAsHome: false,

        mailingReceiverName: '',
        mailingPhone: '',
        mailingProvinceCity: '',
        mailingCountry: '',
        mailingDetailedAddress: '',
        mailingZipcode: '',
        mailingSyncOption: 'None', // 'Home', 'Current', 'Self', 'None'

        // Section 3: Passport and Visa Information
        hasPassport: 'I have passport',
        passportNo: '',
        passportStartDate: '',
        passportExpiryDate: '',
        oldPassportNo: '',
        oldPassportExpiryDate: '',
        applyVisaCountry: '',
        applyVisaEmbassy: '',

        hasStudiedInChina: 'No',
        isInChinaNow: 'No',
        chinaVisaType: '',
        chinaVisaExpiryDate: '',
        chinaStudyStartDate: '',
        chinaStudyEndDate: '',
        chinaInstitution: '',

        // Section 4: Financial Sponsor's Information
        financialSponsors: [],

        // Section 5: Emergency Contact
        emergencyContacts: [],

        // Section 6: Guarantor's Information
        guarantors: [],

        // --- TAB 2 Fields ---
        // Major's Information
        majorCourse: '',
        majorTeachingLanguage: '',
        majorDegree: '',
        majorCollege: '',
        majorEntryYear: '',
        majorEntrySeason: '',
        majorStudyDuration: '',
        majorEnrollmentCategory: '',
        referenceType: '',
        applyForScholarship: '', // Yes/No
        preferences: [], // Keep for compatibility if needed or remove if fully replaced

        // Referee Information
        referees: [], // Array of { name, organization, phone, email, title }

        // Language Proficiency
        englishProficiency: '', // Excellent, Good, Fair, Poor
        chineseProficiency: '', // Excellent, Good, Fair, Poor, None

        // English Details
        toeflScore: '',
        ieltsScore: '',
        greScore: '',
        gmatScore: '',
        duolingoScore: '',
        toeicScore: '',
        otherEnglishCertificate: '',

        // Chinese Details
        hskLevel: '',
        hskScore: '',
        hskListeningScore: '',
        hskReadingScore: '',
        hskWritingScore: '',
        hskNo: '',
        hskTestDate: '',

        hskkLevel: '',
        hskkScore: '',

        // Chinese Learning History
        chineseLearningStartDate: '',
        chineseLearningEndDate: '',
        chineseTeacherNationality: '', // Yes/No
        chineseLearningInstitution: '',

        // Education Background
        educationHighestDegree: '',
        educationHighestSchool: '',
        educationCertificateType: '',
        educationFailure: '', // Yes/No
        educationMarkRange: '', // e.g. 100, 5.0, 4.0
        educations: [], // Array of { school, startDate, endDate, fieldOfStudy, diploma, schoolType, country, contactPerson, phone, email, gpa }

        // Work Experience
        workExperiences: [], // Array of { startDate, endDate, company, occupation, reference, phone, email, industryType, workPlace, contactPerson }
        workedInChina: '', // Yes/No
        chinaWorkPlace: '',
        chinaWorkStartDate: '',
        chinaWorkEndDate: '',

        // Family Members
        familyMembers: [], // Array of { name, nationality, relationship, workUnit, position, phone }

        // Section 3: Documents
        documents: {
            passportPhotoPage: null,
            highestDegreeCertificate: null,
            academicTranscripts: null,
            languageCertificate: null,
            physicalExamForm: null,
            paymentCertificate: null,
            economicGuarantee: null,
            noCriminalRecord: null,
            guardianshipLetter: null,
            otherDocuments: null
        },
        moreInfo: {
            video: null,
            // Nationality Background Fields
            isImmigrant: '', // 'Yes' or 'No'
            hasChineseParent: '', // 'Yes' or 'No'
            originalCountry: '',
            currentCitizenshipDate: '',

            awards: [],
            guardians: [], // Changed from single object to array
            otherInfo: {
                cscNo: '',
                hobbies: '',
                isSmoking: '',
                hasDisease: '',
                hasCriminalRecord: '',
                hasCriminalHistory: '', // Note: Image shows both "Certificate" and "committed a crime"
                hasPhysicalExam: ''
            },
            applicationNote: ''
        },

        // Form specific status
        status: 'Draft'
    })

    const [showSponsorForm, setShowSponsorForm] = useState(false)
    const [currentSponsor, setCurrentSponsor] = useState({
        name: '', relationship: '', workPlace: '', nationality: '',
        occupation: '', industryType: '', email: '', phone: ''
    })

    const [showEmergencyForm, setShowEmergencyForm] = useState(false)
    const [currentEmergencyContact, setCurrentEmergencyContact] = useState({
        name: '', relationship: '', workPlace: '',
        occupation: '', industryType: '', email: '', phone: ''
    })

    const [showGuarantorForm, setShowGuarantorForm] = useState(false)
    const [currentGuarantor, setCurrentGuarantor] = useState({
        name: '', relationship: '', workPlace: '', nationality: '',
        occupation: '', industryType: '', email: '', phone: ''
    })

    const [showRefereeForm, setShowRefereeForm] = useState(false)
    const [currentReferee, setCurrentReferee] = useState({
        name: '', relationship: '', workPlace: '', industryType: '',
        occupation: '', email: '', phone: ''
    })

    const [showEducationForm, setShowEducationForm] = useState(false)
    const [currentEducation, setCurrentEducation] = useState({
        degree: '', schoolType: '', country: '', schoolName: '',
        startDate: '', endDate: '', fieldOfStudy: '', diploma: '',
        contactPerson: '', phone: '', email: '',
        gpa: '', remark: ''
    })

    const [showWorkForm, setShowWorkForm] = useState(false)
    const [currentWorkExperience, setCurrentWorkExperience] = useState({
        startDate: '', endDate: '', company: '', occupation: '', industryType: '',
        reference: '', phone: '', email: '', workPlace: '', contactPerson: ''
    })

    const [showFamilyForm, setShowFamilyForm] = useState(false)
    const [currentFamilyMember, setCurrentFamilyMember] = useState({
        name: '', relationship: '', nationality: '', workPlace: '',
        occupation: '', industryType: '', phone: '', email: ''
    })

    // --- More Info State (Awards) ---
    const [showAwardForm, setShowAwardForm] = useState(false)
    const [currentAward, setCurrentAward] = useState({
        name: '',
        type: '',
        level: '',
        area: '',
        date: ''
    })

    const AWARD_TYPES = [
        { name: '学术类 Academic', value: 'Academic' },
        { name: '体育类 Sports', value: 'Sports' },
        { name: '艺术类 Arts', value: 'Arts' },
        { name: '其他 Others', value: 'Others' }
    ]

    const AWARD_LEVELS = [
        { name: '国际级 International', value: 'International' },
        { name: '国家级 National', value: 'National' },
        { name: '省级 Provincial', value: 'Provincial' },
        { name: '校级 School', value: 'School' }
    ]

    const AWARD_AREAS = [
        { name: '数学 Mathematics', value: 'Mathematics' },
        { name: '物理 Physics', value: 'Physics' },
        { name: '化学 Chemistry', value: 'Chemistry' },
        { name: '综合 General', value: 'General' }
    ]

    // --- More Info State (Guardian) ---
    const [showGuardianForm, setShowGuardianForm] = useState(false)
    const [termsAccepted, setTermsAccepted] = useState(false)
    const [currentGuardian, setCurrentGuardian] = useState({
        name: '',
        relationship: '',
        workPlace: '',
        industryType: '',
        occupation: '',
        phone: '',
        email: ''
    })



    const removeGuardian = (id) => {
        setFormData(prev => ({
            ...prev,
            moreInfo: {
                ...prev.moreInfo,
                guardians: prev.moreInfo.guardians.filter(g => g.id !== id)
            }
        }))
    }

    const handleGuardianInputChange = (e) => {
        const { name, value } = e.target
        setCurrentGuardian(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleAddGuardian = () => {
        if (!currentGuardian.name || !currentGuardian.relationship || !currentGuardian.phone) {
            showToast('Please fill in required guardian fields (*)', 'warning')
            return
        }
        setFormData(prev => ({
            ...prev,
            moreInfo: {
                ...prev.moreInfo,
                guardians: [...(prev.moreInfo.guardians || []), { ...currentGuardian, id: Date.now() }]
            }
        }))
        setShowGuardianForm(false)
        setCurrentGuardian({ name: '', relationship: '', workPlace: '', industryType: '', occupation: '', phone: '', email: '' })
        showToast('Guardian added', 'success')
    }

    useEffect(() => {
        const loadData = async () => {
            if (!applicationId) return;

            try {
                // Fetch Applications and Scholarships in parallel
                const [appRes, schRes] = await Promise.all([
                    fetch(`${API_URL}/applications`),
                    fetch(`${API_URL}/scholarships`)
                ]);

                const apps = await appRes.json();
                const allScholarships = await schRes.json();
                setScholarships(allScholarships);

                const app = apps.find(a => (a._id === applicationId || a.id === applicationId));

                if (app) {
                    // Check if application is already submitted - prevent access via back button UNLESS canReapply is true
                    if (app.status === 'Approved' && !app.canReapply) {
                        showToast('This application has already been submitted and cannot be edited. Please contact admin if you need to make changes.', 'info');
                        navigate('/dashboard', { replace: true });
                        return;
                    }

                    setApplication(app);

                    // Find linked scholarship
                    const linkedScholarship = allScholarships.find(s =>
                        s.name === app.scholarshipName || s.title === app.scholarshipName
                    );

                    setFormData(prev => ({
                        ...prev,
                        ...app, // Spread saved application state
                        // Map Scholarship Data if Major info is empty (i.e., first load/not saved yet)
                        majorCourse: app.majorCourse || (linkedScholarship ? linkedScholarship.field : ''),
                        majorTeachingLanguage: app.majorTeachingLanguage || (linkedScholarship?.language || 'English'), // Fallback if not in DB
                        majorDegree: app.majorDegree || (linkedScholarship ? linkedScholarship.degree : ''),
                        majorCollege: app.majorCollege || (linkedScholarship?.university || 'International College'), // Fallback
                        majorEntryYear: app.majorEntryYear || (linkedScholarship?.deadline ? new Date(linkedScholarship.deadline).getFullYear().toString() : new Date().getFullYear().toString()),
                        majorEntrySeason: app.majorEntrySeason || 'Autumn',
                        majorStudyDuration: app.majorStudyDuration || (linkedScholarship?.duration || '4 Years'),
                        majorEnrollmentCategory: app.majorEnrollmentCategory || (linkedScholarship?.name || linkedScholarship?.title || 'Self-funded Program')
                    }));
                } else {
                    // Security: Redirect admins
                    // Note: AuthContext might need to be checked if 'user' is available here.
                    // But we can check session or just rely on the fact that if they are an admin, 
                    // they shouldn't be here. However, ApplicationFormPage doesn't have useAuth()?
                    // Let me check imports.
                    showToast('Application not found', 'error');
                    navigate('/dashboard');
                }
            } catch (err) {
                console.error(err);
                showToast('Failed to load data', 'error');
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [applicationId, navigate, showToast]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target
        const inputValue = type === 'checkbox' ? checked : value

        setFormData(prev => {
            const newData = { ...prev, [name]: inputValue }

            // Handle name empty checkboxes
            if (name === 'isFamilyNameEmpty' && inputValue) {
                newData.passportFamilyName = ''
            }
            if (name === 'isGivenNameEmpty' && inputValue) {
                newData.givenName = ''
            }

            // Auto-update full name
            if (name === 'passportFamilyName' || name === 'givenName' || name === 'isFamilyNameEmpty' || name === 'isGivenNameEmpty') {
                const family = newData.isFamilyNameEmpty ? '' : newData.passportFamilyName
                const given = newData.isGivenNameEmpty ? '' : newData.givenName
                newData.fullNameOnPassport = `${family} ${given}`.trim().toUpperCase()

                // Capitalize inputs
                if (name === 'passportFamilyName') newData.passportFamilyName = value.toUpperCase()
                if (name === 'givenName') newData.givenName = value.toUpperCase()
            }

            // Handle Section 2: Correspondence Address Sync Logic
            if (name === 'isCurrentSameAsHome') {
                if (inputValue) {
                    newData.currentDetailedAddress = newData.homeDetailedAddress
                    newData.currentCityProvince = newData.homeCityProvince
                    newData.currentCountry = newData.homeCountry
                    newData.currentZipcode = newData.homeZipcode
                    newData.currentPhone = newData.homePhone
                    newData.currentEmail = newData.homeMainEmail
                }
            }

            if (newData.isCurrentSameAsHome) {
                if (name.startsWith('home')) {
                    const currentFieldName = name.replace('home', 'current').replace('MainEmail', 'Email')
                    if (Object.prototype.hasOwnProperty.call(newData, currentFieldName)) {
                        newData[currentFieldName] = inputValue
                    }
                }
            }

            // Handle Section: Mailing Address Sync Logic
            if (name === 'mailingSyncOption') {
                if (inputValue === 'Home') {
                    newData.mailingReceiverName = `${newData.passportFamilyName} ${newData.givenName}`.trim()
                    newData.mailingPhone = newData.homePhone
                    newData.mailingProvinceCity = newData.homeCityProvince
                    newData.mailingCountry = newData.homeCountry
                    newData.mailingDetailedAddress = newData.homeDetailedAddress
                    newData.mailingZipcode = newData.homeZipcode
                } else if (inputValue === 'Current') {
                    newData.mailingReceiverName = `${newData.passportFamilyName} ${newData.givenName}`.trim()
                    newData.mailingPhone = newData.currentPhone
                    newData.mailingProvinceCity = newData.currentCityProvince
                    newData.mailingCountry = newData.currentCountry
                    newData.mailingDetailedAddress = newData.currentDetailedAddress
                    newData.mailingZipcode = newData.currentZipcode
                } else if (inputValue === 'Self') {
                    newData.mailingReceiverName = 'Self Pickup / 自取'
                    newData.mailingPhone = ''
                    newData.mailingProvinceCity = ''
                    newData.mailingCountry = ''
                    newData.mailingDetailedAddress = 'I will pick up by myself'
                    newData.mailingZipcode = ''
                }
            }

            // Real-time sync for Mailing Address
            if (newData.mailingSyncOption === 'Home') {
                if (name.startsWith('home') || name === 'passportFamilyName' || name === 'givenName') {
                    if (name === 'passportFamilyName' || name === 'givenName') {
                        newData.mailingReceiverName = `${newData.passportFamilyName} ${newData.givenName}`.trim()
                    } else {
                        const mailingFieldName = name.replace('home', 'mailing')
                        if (Object.prototype.hasOwnProperty.call(newData, mailingFieldName)) {
                            newData[mailingFieldName] = inputValue
                        }
                    }
                }
            } else if (newData.mailingSyncOption === 'Current') {
                if (name.startsWith('current') || name === 'passportFamilyName' || name === 'givenName' || name === 'isCurrentSameAsHome') {
                    if (name === 'passportFamilyName' || name === 'givenName') {
                        newData.mailingReceiverName = `${newData.passportFamilyName} ${newData.givenName}`.trim()
                    } else if (name.startsWith('current')) {
                        const mailingFieldName = name.replace('current', 'mailing').replace('Email', '')
                        if (Object.prototype.hasOwnProperty.call(newData, mailingFieldName)) {
                            newData[mailingFieldName] = inputValue
                        }
                    } else if (name.startsWith('home') && newData.isCurrentSameAsHome) {
                        const currentFieldName = name.replace('home', 'current').replace('MainEmail', 'Email')
                        const mailingFieldName = currentFieldName.replace('current', 'mailing').replace('Email', '')
                        if (Object.prototype.hasOwnProperty.call(newData, mailingFieldName)) {
                            newData[mailingFieldName] = inputValue
                        }
                    }
                }
            }

            return newData
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSaving(true)
        try {
            const response = await fetch(`${API_URL}/applications/${applicationId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    ...formData,
                    status: 'Approved', // Directly approve application on submit
                    submittedAt: new Date()
                })
            })

            if (response.ok) {
                showToast('Application submitted successfully!', 'success')
                navigate('/dashboard')
            } else {
                showToast('Failed to submit application', 'error')
            }
        } catch (error) {
            showToast('Network error occurred', 'error')
        } finally {
            setSaving(false)
        }
    }

    const handleSaveDraft = async () => {
        setSaving(true)
        try {
            await fetch(`${API_URL}/applications/${applicationId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ ...formData, status: 'Draft' })
            })
            showToast('Draft saved successfully', 'success')
        } catch (error) {
            showToast('Failed to save draft', 'error')
        } finally {
            setSaving(false)
        }
    }

    const handleSubmitApplication = async () => {
        if (!termsAccepted) {
            showToast('Please accept the terms and conditions before submitting', 'warning')
            return
        }

        // No confirmation dialog - proceed directly with submission

        try {
            setLoading(true)

            // 1. Prepare data for submission
            const submissionData = {
                ...formData,
                status: 'Approved',
                canReapply: false,
                submittedAt: new Date().toISOString()
            }

            // 2. Submit Update
            const response = await fetch(`${API_URL}/applications/${applicationId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(submissionData)
            })

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}))
                throw new Error(errorData.error || 'Failed to submit application')
            }

            showToast('Application Submitted Successfully!', 'success')
            // Redirect to dashboard
            setTimeout(() => {
                navigate('/dashboard')
            }, 1500)

        } catch (error) {
            console.error('Submission error:', error)
            showToast(error.message || 'Failed to submit application. Please try again.', 'error')
        } finally {
            setLoading(false)
        }
    }

    const handleSponsorInputChange = (e) => {
        const { name, value } = e.target
        setCurrentSponsor(prev => ({ ...prev, [name]: value }))
    }

    const handleAddSponsor = () => {
        if (!currentSponsor.name || !currentSponsor.relationship) {
            showToast('Please fill in required sponsor details', 'warning')
            return
        }
        setFormData(prev => ({
            ...prev,
            financialSponsors: [...prev.financialSponsors, { ...currentSponsor, id: Date.now() }]
        }))
        setShowSponsorForm(false)
        setCurrentSponsor({
            name: '', relationship: '', workPlace: '', nationality: '',
            occupation: '', industryType: '', email: '', phone: ''
        })
        showToast('Sponsor added to list', 'success')
    }

    const removeSponsor = (id) => {
        setFormData(prev => ({
            ...prev,
            financialSponsors: prev.financialSponsors.filter(s => s.id !== id)
        }))
    }

    // Emergency Contact Handlers
    const handleEmergencyInputChange = (e) => {
        const { name, value } = e.target
        setCurrentEmergencyContact(prev => ({ ...prev, [name]: value }))
    }

    const handleAddEmergency = () => {
        if (!currentEmergencyContact.name || !currentEmergencyContact.relationship) {
            showToast('Please fill in required contact details', 'warning')
            return
        }
        setFormData(prev => ({
            ...prev,
            emergencyContacts: [...prev.emergencyContacts, { ...currentEmergencyContact, id: Date.now() }]
        }))
        setShowEmergencyForm(false)
        setCurrentEmergencyContact({
            name: '', relationship: '', workPlace: '',
            occupation: '', industryType: '', email: '', phone: ''
        })
        showToast('Emergency contact added', 'success')
    }

    const removeEmergency = (id) => {
        setFormData(prev => ({
            ...prev,
            emergencyContacts: prev.emergencyContacts.filter(c => c.id !== id)
        }))
    }

    // Guarantor Handlers
    const handleGuarantorInputChange = (e) => {
        const { name, value } = e.target
        setCurrentGuarantor(prev => ({ ...prev, [name]: value }))
    }

    const handleAddGuarantor = () => {
        if (!currentGuarantor.name || !currentGuarantor.relationship) {
            showToast('Please fill in required guarantor details', 'warning')
            return
        }
        setFormData(prev => ({
            ...prev,
            guarantors: [...prev.guarantors, { ...currentGuarantor, id: Date.now() }]
        }))
        setShowGuarantorForm(false)
        setCurrentGuarantor({
            name: '', relationship: '', workPlace: '', nationality: '',
            occupation: '', industryType: '', email: '', phone: ''
        })
        showToast('Guarantor added to list', 'success')
    }

    const removeGuarantor = (id) => {
        setFormData(prev => ({
            ...prev,
            guarantors: prev.guarantors.filter(g => g.id !== id)
        }))
    }

    // --- Referee Handlers ---
    const handleRefereeInputChange = (e) => {
        const { name, value } = e.target
        setCurrentReferee(prev => ({ ...prev, [name]: value }))
    }

    const handleAddReferee = () => {
        if (!currentReferee.name || !currentReferee.relationship || !currentReferee.workPlace || !currentReferee.industryType || !currentReferee.occupation || !currentReferee.phone || !currentReferee.email) {
            showToast('Please fill in all required fields (*) to continue', 'warning')
            return
        }
        setFormData(prev => ({
            ...prev,
            referees: [...prev.referees, { ...currentReferee, id: Date.now() }]
        }))
        setShowRefereeForm(false)
        setCurrentReferee({
            name: '', relationship: '', workPlace: '', industryType: '',
            occupation: '', email: '', phone: ''
        })
        showToast('Referee added successfully', 'success')
    }

    const removeReferee = (id) => {
        setFormData(prev => ({
            ...prev,
            referees: prev.referees.filter(r => r.id !== id)
        }))
    }

    // --- Education Handlers ---
    const handleEducationInputChange = (e) => {
        const { name, value } = e.target
        setCurrentEducation(prev => ({ ...prev, [name]: value }))
    }

    const handleAddEducation = () => {
        if (!currentEducation.degree || !currentEducation.schoolType || !currentEducation.country || !currentEducation.schoolName || !currentEducation.startDate || !currentEducation.endDate || !currentEducation.fieldOfStudy || !currentEducation.diploma) {
            showToast('Please fill in all required fields (*) to continue', 'warning')
            return
        }
        setFormData(prev => ({
            ...prev,
            educations: [...prev.educations, { ...currentEducation, id: Date.now() }]
        }))
        setShowEducationForm(false)
        setCurrentEducation({
            degree: '', schoolType: '', country: '', schoolName: '',
            startDate: '', endDate: '', fieldOfStudy: '', diploma: '',
            contactPerson: '', phone: '', email: '',
            gpa: '', remark: ''
        })
        showToast('Education added successfully', 'success')
    }

    const removeEducation = (id) => {
        setFormData(prev => ({
            ...prev,
            educations: prev.educations.filter(e => e.id !== id)
        }))
        showToast('Education removed', 'info')
    }

    // --- Work Experience Handlers ---
    const handleWorkInputChange = (e) => {
        const { name, value } = e.target
        setCurrentWorkExperience(prev => ({ ...prev, [name]: value }))
    }

    const handleAddWork = () => {
        if (!currentWorkExperience.startDate || !currentWorkExperience.endDate || !currentWorkExperience.workPlace || !currentWorkExperience.industryType || !currentWorkExperience.occupation || !currentWorkExperience.phone || !currentWorkExperience.contactPerson || !currentWorkExperience.email) {
            showToast('Please fill in all required fields (*) to continue', 'warning')
            return
        }
        setFormData(prev => ({
            ...prev,
            workExperiences: [...prev.workExperiences, { ...currentWorkExperience, id: Date.now() }]
        }))
        setShowWorkForm(false)
        setCurrentWorkExperience({
            startDate: '', endDate: '', company: '', occupation: '', industryType: '',
            reference: '', phone: '', email: '', workPlace: '', contactPerson: ''
        })
        showToast('Work experience added', 'success')
    }

    const removeWork = (id) => {
        setFormData(prev => ({
            ...prev,
            workExperiences: prev.workExperiences.filter(w => w.id !== id)
        }))
        showToast('Work experience removed', 'info')
    }

    // --- Family Members Handlers ---
    const handleFamilyInputChange = (e) => {
        const { name, value } = e.target
        setCurrentFamilyMember(prev => ({ ...prev, [name]: value }))
    }

    const handleAddFamily = () => {
        if (!currentFamilyMember.name || !currentFamilyMember.relationship || !currentFamilyMember.nationality || !currentFamilyMember.workPlace || !currentFamilyMember.occupation || !currentFamilyMember.industryType || !currentFamilyMember.phone || !currentFamilyMember.email) {
            showToast('Please fill in all required fields (*) to continue', 'warning')
            return
        }
        setFormData(prev => ({
            ...prev,
            familyMembers: [...prev.familyMembers, { ...currentFamilyMember, id: Date.now() }]
        }))
        setShowFamilyForm(false)
        setCurrentFamilyMember({
            name: '', relationship: '', nationality: '', workPlace: '',
            occupation: '', industryType: '', phone: '', email: ''
        })
        showToast('Family member added', 'success')
    }

    const removeFamily = (id) => {
        setFormData(prev => ({
            ...prev,
            familyMembers: prev.familyMembers.filter(f => f.id !== id)
        }))
        showToast('Family member removed', 'info')
    }

    // --- More Info Handlers ---
    const handleMoreInfoChange = (e) => {
        const { name, value } = e.target
        // Check if the field belongs to 'otherInfo' nested object
        const otherInfoFields = ['cscNo', 'hobbies', 'isSmoking', 'hasDisease', 'hasCriminalRecord', 'hasCriminalHistory', 'hasPhysicalExam']

        if (otherInfoFields.includes(name)) {
            setFormData(prev => ({
                ...prev,
                moreInfo: {
                    ...prev.moreInfo,
                    otherInfo: {
                        ...prev.moreInfo.otherInfo,
                        [name]: value
                    }
                }
            }))
        } else {
            setFormData(prev => ({
                ...prev,
                moreInfo: {
                    ...prev.moreInfo,
                    [name]: value
                }
            }))
        }
    }

    const handleGuardianChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            moreInfo: {
                ...prev.moreInfo,
                guardian: {
                    ...prev.moreInfo.guardian,
                    [name]: value
                }
            }
        }))
    }

    const handleVideoUpload = async (e) => {
        const file = e.target.files[0]
        if (file) {
            // Video size limit: 50MB
            if (file.size > 50 * 1024 * 1024) {
                showToast('Video size exceeds 50MB limit', 'error')
                return
            }
            if (!file.type.startsWith('video/')) {
                showToast('Please upload a valid video file', 'error')
                return
            }

            // Show uploading status
            setUploadingStatus(prev => ({ ...prev, 'video': true }))
            showToast('Uploading video...', 'info')

            try {
                const formData = new FormData()
                formData.append('file', file)

                const response = await fetch(`${API_URL}/upload`, {
                    method: 'POST',
                    body: formData,
                })

                if (!response.ok) throw new Error('Upload failed')

                const data = await response.json()
                if (data.url && typeof data.url === 'string') {
                    setFormData(prev => ({
                        ...prev,
                        moreInfo: {
                            ...prev.moreInfo,
                            video: data.url
                        }
                    }))
                    showToast('Video uploaded successfully', 'success')
                } else {
                    throw new Error('Invalid URL returned')
                }
            } catch (error) {
                console.error('Video upload error:', error)
                showToast('Failed to upload video', 'error')
            } finally {
                setUploadingStatus(prev => ({ ...prev, 'video': false }))
            }
        }
    }

    const handleAwardInputChange = (e) => {
        const { name, value } = e.target
        setCurrentAward(prev => ({ ...prev, [name]: value }))
    }

    const handleAddAward = () => {
        if (!currentAward.name || !currentAward.type || !currentAward.level || !currentAward.area || !currentAward.date) {
            showToast('Please fill in all required award fields (*)', 'warning')
            return
        }
        setFormData(prev => ({
            ...prev,
            moreInfo: {
                ...prev.moreInfo,
                awards: [...prev.moreInfo.awards, { ...currentAward, id: Date.now() }]
            }
        }))
        setShowAwardForm(false)
        setCurrentAward({ name: '', type: '', level: '', area: '', date: '' })
        showToast('Award added', 'success')
    }

    const removeAward = (id) => {
        setFormData(prev => ({
            ...prev,
            moreInfo: {
                ...prev.moreInfo,
                awards: prev.moreInfo.awards.filter(a => a.id !== id)
            }
        }))
        showToast('Award removed', 'info')
    }

    // --- Helper for Tab 5 Summary ---
    const renderReviewValue = (value) => {
        if (value === null || value === undefined || value === '' || (Array.isArray(value) && value.length === 0)) {
            return <span className="text-red-500 font-bold">-</span>
        }
        return value
    }

    const ReviewCard = ({ title, color, children, noPadding, className = "" }) => (
        <div className={`bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden ${className}`}>
            <div className="p-4 sm:p-6 pb-0">
                <div
                    className="inline-flex items-center gap-3 px-6 py-2 rounded-r-full shadow-sm"
                    style={{ backgroundColor: color }}
                >
                    <div className="w-4 h-4 bg-white transform rotate-45 flex items-center justify-center">
                        <div className="w-2 h-2" style={{ backgroundColor: color }}></div>
                    </div>
                    <h3 className="text-white font-bold text-sm sm:text-base tracking-wide uppercase">
                        {title}
                    </h3>
                </div>
            </div>
            <div className={noPadding ? "" : "p-8 pt-6"}>
                {children}
            </div>
        </div>
    )

    const DetailItem = ({ label, value, tiny, uppercase, fullWidth }) => (
        <div className={`flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4 pb-2 border-b border-slate-50 last:border-0 ${tiny ? 'text-xs' : 'text-sm'} ${fullWidth ? 'col-span-full' : ''}`}>
            <span className="text-slate-500 min-w-[200px] shrink-0 font-medium">{label}</span>
            <span className={`font-bold text-slate-800 break-words ${uppercase ? 'uppercase' : ''}`}>
                {renderReviewValue(value)}
            </span>
        </div>
    )

    const ReviewTable = ({ headers, rows }) => (
        <div className="overflow-x-auto border border-slate-200 rounded-lg shadow-sm">
            <table className="w-full text-sm text-left border-collapse">
                <thead className="bg-[#F8F9FA] text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                        {headers.map((h, i) => (
                            <th key={i} className="px-4 py-3 border-r last:border-r-0 border-slate-200 text-center align-middle whitespace-pre-line leading-tight">
                                {h}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                    {rows && rows.length > 0 ? (
                        rows.map((row, ri) => (
                            <tr key={ri} className="hover:bg-slate-50 transition-colors">
                                {row.map((cell, ci) => (
                                    <td key={ci} className="px-4 py-3 border-r last:border-r-0 border-slate-200 text-center align-middle">
                                        {renderReviewValue(cell)}
                                    </td>
                                ))}
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={headers.length} className="px-4 py-10 text-center text-slate-400 italic bg-slate-50/50">
                                No records added / 未添加记录
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    )

    const uploadFile = async (file, key) => {
        setUploadingStatus(prev => ({ ...prev, [key]: true }))
        const formData = new FormData()
        formData.append('file', file)

        try {
            const response = await fetch(`${API_URL}/upload`, {
                method: 'POST',
                body: formData,
            })

            if (!response.ok) throw new Error('Upload failed')

            const data = await response.json()
            if (data.url && typeof data.url === 'string') {
                return data.url
            } else {
                console.error('Invalid URL returned from upload:', data)
                return null
            }
        } catch (error) {
            console.error('File upload error:', error)
            showToast(`Failed to upload ${key}`, 'error')
            return null
        } finally {
            setUploadingStatus(prev => ({ ...prev, [key]: false }))
        }
    }

    // --- Submission Handler ---
    const handleFileChange = async (e, documentKey) => {
        const file = e.target.files[0]
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                showToast('File size exceeds 5MB limit', 'error')
                return
            }

            const uploadedUrl = await uploadFile(file, documentKey)
            if (uploadedUrl) {
                setFormData(prev => ({
                    ...prev,
                    documents: {
                        ...prev.documents,
                        [documentKey]: uploadedUrl
                    }
                }))
                showToast('File uploaded successfully', 'success')
            }
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] relative font-sans pt-16">
            {/* World Map Background Overlay */}
            <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/world-map.png')] bg-repeat"></div>

            <DashboardNavbar
                portalName="Visa Application Portal"
                userName={application?.firstName + ' ' + application?.lastName}
                onLogout={() => navigate('/login')}
            />

            {/* Navigation Tabs Container */}
            <div className="bg-white/80 backdrop-blur-xl border-b border-slate-200 sticky top-16 z-40 shadow-sm transition-all duration-300">
                <div className="max-w-7xl mx-auto">
                    {/* Level 1: Main Tabs */}
                    <div className="flex items-center justify-between px-4 lg:px-8 py-2 overflow-x-auto no-scrollbar">
                        {MAIN_TABS.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveMainTab(tab.id)}
                                className={`flex flex-col items-center px-4 py-2 min-w-[140px] transition-all relative ${activeMainTab === tab.id ? 'opacity-100 scale-105' : 'opacity-50 hover:opacity-80'
                                    }`}
                            >
                                <span className={`text-lg font-serif mb-1 ${activeMainTab === tab.id ? 'text-slate-800 font-bold' : 'text-slate-400 font-medium'
                                    }`}>
                                    {tab.label}
                                </span>
                                <span className={`text-[10px] uppercase tracking-wider ${activeMainTab === tab.id ? 'text-sky-600 font-bold' : 'text-slate-400'
                                    }`}>
                                    {tab.subLabel}
                                </span>
                                {activeMainTab === tab.id && (
                                    <div className="absolute -bottom-2.5 left-0 w-full h-[3px] bg-sky-500 rounded-t-full shadow-[0_-2px_6px_rgba(14,165,233,0.3)]"></div>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Level 2: Sub-Navbar (Sections) - Visible for Tab 1, 2 & 4 */}
                    {(activeMainTab === 1 || activeMainTab === 2 || activeMainTab === 4) && (
                        <div className="border-t border-slate-100 bg-slate-50/50">
                            <div className="flex items-center gap-6 px-4 lg:px-8 py-3 overflow-x-auto no-scrollbar mask-gradient-right">
                                {(activeMainTab === 1 ? TAB1_SUB_TABS : activeMainTab === 2 ? TAB2_SUB_TABS : TAB4_SUB_TABS).map(tab => {
                                    const status = checkSectionStatus(tab.id, formData)
                                    const isActive = false // We could implement scroll spy later

                                    return (
                                        <button
                                            key={tab.id}
                                            onClick={() => {
                                                // Ideally scroll to section
                                                const element = document.getElementById(tab.id)
                                                if (element) element.scrollIntoView({ behavior: 'smooth', block: 'center' })
                                            }}
                                            className="flex items-start gap-3 min-w-[200px] text-left group transition-all hover:bg-white hover:shadow-sm rounded-lg p-2"
                                        >
                                            {/* Status Icon */}
                                            <div className="mt-0.5 shrink-0">
                                                {status === 'complete' ? (
                                                    <div className="w-8 h-8 rounded-lg bg-sky-100 flex items-center justify-center text-sky-600 shadow-sm border border-sky-200">
                                                        <Edit3 className="w-4 h-4" />
                                                    </div>
                                                ) : (
                                                    <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center text-rose-500 shadow-sm border border-rose-200 animate-pulse-slow">
                                                        <AlertTriangle className="w-4 h-4 fill-current" />
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold text-slate-700 leading-tight group-hover:text-sky-600 transition-colors">
                                                    {tab.label}
                                                </span>
                                                <span className="text-[10px] text-slate-500 font-medium leading-tight mt-0.5">
                                                    {tab.subLabel}
                                                </span>
                                            </div>
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <main className="relative z-10 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <div className="max-w-5xl mx-auto py-10 pt-6">

                    {/* Header Notice */}
                    <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 mb-8 border border-sky-100 shadow-sm animate-fadeIn">
                        <div className="flex items-start gap-4">
                            <div className="bg-sky-100 p-2 rounded-xl">
                                <Info className="w-6 h-6 text-sky-600" />
                            </div>
                            <div>
                                <p className="text-[#334155] font-bold text-lg mb-1">所填写内容涉及留学签证申请，请认真填写所有内容，确保信息准确性</p>
                                <p className="text-slate-500 text-sm">Information provided below will be used for visa application, please fill in carefully and ensure its authenticity and accuracy.</p>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-10">

                        {/* ================= TAB 1 CONTENT ================= */}
                        {activeMainTab === 1 && (
                            <div className="space-y-10">
                                {/* SECTION 1: PERSONAL INFORMATION */}
                                <div id="personal" className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 overflow-hidden border border-slate-100 animate-slideUp">
                                    <div className="bg-[#0EA5E9] px-8 py-5 flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center backdrop-blur-sm">
                                            <Diamond className="w-4 h-4 text-white fill-white" />
                                        </div>
                                        <h3 className="text-white font-bold text-xl uppercase tracking-tight">个人基本信息 Personal Information</h3>
                                    </div>

                                    <div className="p-8 lg:p-10 flex flex-col lg:flex-row gap-12">
                                        {/* Left Column: Core Identity */}
                                        <div className="flex-1 space-y-8">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                                {/* Passport Family Name */}
                                                <div className="space-y-3">
                                                    <label className="text-xs font-bold text-sky-600 uppercase tracking-wider flex items-center gap-1">
                                                        护照姓 Passport Family Name <span className="text-rose-500">*</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="passportFamilyName"
                                                        disabled={formData.isFamilyNameEmpty}
                                                        value={formData.passportFamilyName}
                                                        onChange={handleInputChange}
                                                        className={`w-full bg-white border ${formData.isFamilyNameEmpty ? 'border-slate-100 bg-slate-50' : 'border-slate-200'} rounded-lg px-4 py-2.5 focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all font-medium text-slate-700 placeholder:text-slate-300`}
                                                        placeholder="EMMANUEL"
                                                    />
                                                    <label className="flex items-center gap-2 cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            name="isFamilyNameEmpty"
                                                            checked={formData.isFamilyNameEmpty}
                                                            onChange={handleInputChange}
                                                            className="w-4 h-4 rounded border-slate-300 text-sky-500 focus:ring-sky-500"
                                                        />
                                                        <span className="text-xs font-bold text-slate-700">护照上的姓为空 The family name in the passport is empty</span>
                                                    </label>
                                                </div>

                                                {/* Given Name */}
                                                <div className="space-y-3">
                                                    <label className="text-xs font-bold text-sky-600 uppercase tracking-wider flex items-center gap-1">
                                                        护照名 Given Name <span className="text-rose-500">*</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="givenName"
                                                        disabled={formData.isGivenNameEmpty}
                                                        value={formData.givenName}
                                                        onChange={handleInputChange}
                                                        className={`w-full bg-white border ${formData.isGivenNameEmpty ? 'border-slate-100 bg-slate-50' : 'border-slate-200'} rounded-lg px-4 py-2.5 focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all font-medium text-slate-700 placeholder:text-slate-300`}
                                                        placeholder="SABATO"
                                                    />
                                                    <label className="flex items-center gap-2 cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            name="isGivenNameEmpty"
                                                            checked={formData.isGivenNameEmpty}
                                                            onChange={handleInputChange}
                                                            className="w-4 h-4 rounded border-slate-300 text-sky-500 focus:ring-sky-500"
                                                        />
                                                        <span className="text-xs font-bold text-slate-700">护照上的名为空 The given name in the passport is empty</span>
                                                    </label>
                                                </div>

                                                {/* Full Name Display */}
                                                <div className="md:col-span-2 space-y-3">
                                                    <label className="text-xs font-bold text-sky-500 uppercase tracking-wider flex items-center gap-1">
                                                        护照全名 Full Name as shown on your passport <span className="text-rose-500">*</span>
                                                    </label>
                                                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 space-y-4">
                                                        <div className="bg-white/50 rounded-xl p-4 border border-dashed border-slate-200">
                                                            <p className="text-[11px] font-bold text-slate-700 leading-normal">系统中将使用的所有姓名（包括学期证书），请认真填写，确认全无误。</p>
                                                            <p className="text-[10px] text-slate-500 leading-normal">The full name in the system will be used in all your certificates (including degree certificate). Please fill in carefully and confirm.</p>
                                                        </div>
                                                        <div className="relative">
                                                            <input
                                                                type="text"
                                                                readOnly
                                                                value={formData.fullNameOnPassport}
                                                                className="w-full bg-white border border-slate-200 rounded-lg px-5 py-3 font-bold text-[#4F46E5] tracking-wide uppercase shadow-sm"
                                                            />
                                                            <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 p-2 hover:bg-slate-50 rounded-lg transition-colors text-sky-500">
                                                                <Edit3 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Gender */}
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold text-sky-600 uppercase tracking-wider flex items-center gap-1">性别 Gender <span className="text-rose-500">*</span></label>
                                                    <div className="flex gap-8 items-center bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                                                        {['Female', 'Male'].map(g => (
                                                            <label key={g} className="flex items-center gap-3 cursor-pointer group">
                                                                <div className="relative flex items-center justify-center">
                                                                    <input
                                                                        type="radio"
                                                                        name="gender"
                                                                        value={g}
                                                                        checked={formData.gender === g}
                                                                        onChange={handleInputChange}
                                                                        className="peer appearance-none w-5 h-5 border-2 border-slate-200 rounded-full checked:border-sky-500 transition-all"
                                                                    />
                                                                    <div className="absolute w-2.5 h-2.5 bg-sky-500 rounded-full scale-0 peer-checked:scale-100 transition-all"></div>
                                                                </div>
                                                                <span className={`text-sm font-bold ${formData.gender === g ? 'text-sky-600' : 'text-slate-500'} group-hover:text-sky-500 transition-colors uppercase tracking-tight`}>
                                                                    {g === 'Female' ? '女性 Female' : '男性 Male'}
                                                                </span>
                                                            </label>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Chinese Name */}
                                                <div className="md:col-span-2 space-y-3 mt-4">
                                                    <label className="text-xs font-bold text-sky-600 uppercase tracking-wider">中文名 Chinese Name</label>
                                                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 space-y-4">
                                                        <div className="flex items-center justify-between gap-4">
                                                            <div>
                                                                <p className="text-[11px] font-bold text-slate-700">没有中文名？帮我取一个</p>
                                                                <p className="text-[10px] text-slate-500">Don't have a Chinese name? Get one now.</p>
                                                            </div>
                                                            <button type="button" className="px-5 py-2.5 bg-[#0EA5E9] hover:bg-sky-600 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all shadow-lg shadow-sky-100">
                                                                取名/更换 Get/Change
                                                            </button>
                                                        </div>
                                                        <input
                                                            type="text"
                                                            name="chineseName"
                                                            value={formData.chineseName}
                                                            onChange={handleInputChange}
                                                            className="w-full bg-white border border-slate-200 rounded-lg px-5 py-3 font-medium text-slate-700 placeholder:text-slate-200 shadow-sm"
                                                            placeholder="Chinese Name"
                                                        />
                                                    </div>
                                                </div>

                                                {/* Nationality */}
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold text-sky-600 uppercase tracking-wider flex items-center gap-1">国籍 Nationality <span className="text-rose-500">*</span></label>
                                                    <select
                                                        name="nationality"
                                                        value={formData.nationality}
                                                        onChange={handleInputChange}
                                                        className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 focus:ring-sky-500 font-medium text-slate-700 text-sm"
                                                    >
                                                        <option value="">Please select...</option>
                                                        {NATIONALITIES.map(n => (
                                                            <option key={n.value} value={n.value}>{n.name}</option>
                                                        ))}
                                                    </select>
                                                </div>

                                                {/* Date of Birth */}
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold text-sky-600 uppercase tracking-wider flex items-center gap-1">出生日期 Date of Birth <span className="text-rose-500">*</span></label>
                                                    <input
                                                        type="date"
                                                        name="dob"
                                                        value={formData.dob}
                                                        onChange={handleInputChange}
                                                        className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 font-medium text-slate-700 text-sm"
                                                    />
                                                </div>

                                                {/* Country of Birth */}
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold text-sky-600 uppercase tracking-wider flex items-center gap-1">出生国家或地区 Country of Birth <span className="text-rose-500">*</span></label>
                                                    <select
                                                        name="birthCountry"
                                                        value={formData.birthCountry}
                                                        onChange={handleInputChange}
                                                        className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 focus:ring-sky-500 font-medium text-slate-700 text-sm"
                                                    >
                                                        <option value="">Please select...</option>
                                                        {COUNTRIES.map(c => (
                                                            <option key={c.name} value={c.name}>{c.chinese} {c.name}</option>
                                                        ))}
                                                    </select>
                                                </div>

                                                {/* Place of Birth */}
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold text-sky-600 uppercase tracking-wider flex items-center gap-1">出生地点 Place of Birth <span className="text-rose-500">*</span></label>
                                                    <input
                                                        type="text"
                                                        name="placeOfBirth"
                                                        value={formData.placeOfBirth}
                                                        onChange={handleInputChange}
                                                        className="w-full bg-white border border-rose-200 rounded-lg px-4 py-2.5 focus:ring-sky-500 font-medium text-slate-700 text-sm placeholder:text-rose-200"
                                                        placeholder="PLACE OF BIRTH"
                                                    />
                                                </div>

                                                {/* Native Language */}
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold text-sky-600 uppercase tracking-wider flex items-center gap-1">母语 Native Language <span className="text-rose-500">*</span></label>
                                                    <select
                                                        name="nativeLanguage"
                                                        value={formData.nativeLanguage}
                                                        onChange={handleInputChange}
                                                        className="w-full bg-white border border-rose-200 rounded-lg px-4 py-2.5 focus:ring-sky-500 font-medium text-slate-700 text-sm"
                                                    >
                                                        <option value="">请选择 Please Choose</option>
                                                        {LANGUAGES.map(l => (
                                                            <option key={l.name} value={l.name}>{l.chinese} {l.name}</option>
                                                        ))}
                                                    </select>
                                                </div>

                                            </div>
                                        </div>

                                        {/* Right Column: Photo & Supplemental Info */}
                                        <div className="w-full lg:w-[450px] space-y-8">
                                            {/* Photo Upload Section */}
                                            <div className="flex flex-col md:flex-row gap-6">
                                                <div className="w-32 h-44 rounded-lg bg-slate-50 border border-slate-200 flex flex-col items-center justify-center overflow-hidden shrink-0 relative">
                                                    {uploadingStatus.photo ? (
                                                        <div className="flex flex-col items-center gap-2">
                                                            <Loader2 className="w-8 h-8 text-sky-500 animate-spin" />
                                                            <span className="text-[10px] text-slate-400 font-medium">Uploading...</span>
                                                        </div>
                                                    ) : formData.photo ? (
                                                        <img src={typeof formData.photo === 'string' ? formData.photo : URL.createObjectURL(formData.photo)} alt="Applicant" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="flex flex-col items-center justify-center text-slate-300">
                                                            <User className="w-12 h-12 mb-2" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1 space-y-4">
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            type="file"
                                                            ref={fileInputRef}
                                                            onChange={async (e) => {
                                                                const file = e.target.files[0]
                                                                if (file) {
                                                                    const url = await uploadFile(file, 'photo')
                                                                    if (url) {
                                                                        setFormData(prev => ({ ...prev, photo: url }))
                                                                        showToast('Photo uploaded successfully', 'success')
                                                                    }
                                                                }
                                                            }}
                                                            className="hidden"
                                                            accept="image/*"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => fileInputRef.current?.click()}
                                                            disabled={uploadingStatus.photo}
                                                            className="px-6 py-2 bg-white border border-slate-200 text-slate-500 rounded-md text-xs font-medium hover:bg-slate-50 transition-colors flex items-center gap-2 disabled:opacity-50"
                                                        >
                                                            {uploadingStatus.photo ? 'Uploading...' : 'Browser... 浏览器'}
                                                        </button>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className="text-[10px] text-rose-500 leading-tight">*照片参考格式：彩色2寸免冠证件照，白色背景无边框，头部占照片尺寸的2/3，高宽比为4:3，最大200KB，JPG格式 (*.jpg,*.jpeg,*.png)。<span className="text-sky-500 cursor-pointer">点击裁剪照片</span></p>
                                                        <p className="text-[10px] text-slate-500 leading-tight mt-1">Note: 2 inch bareheaded color photo, white background, no border. The head of the applicant shall account for 2/3 of the whole photo, and the image format should be in *.jpg,*.jpeg,*.png. The size of the photo should be less than 200KB and aspect raito is 4:3.<span className="text-sky-500 cursor-pointer">Click Crop Image</span></p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Supplemental Fields Form */}
                                            <div className="space-y-6">
                                                {/* Marital Status */}
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold text-sky-600 uppercase tracking-wider flex items-center gap-1">婚姻状态 Marital Status <span className="text-rose-500">*</span></label>
                                                    <select
                                                        name="maritalStatus"
                                                        value={formData.maritalStatus}
                                                        onChange={handleInputChange}
                                                        className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 focus:ring-sky-500 font-medium text-slate-700 text-sm appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2232%22%20height%3D%2232%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:1.25em_1.25em] bg-[right_0.75rem_center] bg-no-repeat"
                                                    >
                                                        <option value="">请选择 Please Choose</option>
                                                        <option value="Single">未婚 Single</option>
                                                        <option value="Married">已婚 Married</option>
                                                    </select>
                                                </div>

                                                {/* Religion */}
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold text-sky-600 uppercase tracking-wider flex items-center gap-1">宗教 Religion <span className="text-rose-500">*</span></label>
                                                    <select
                                                        name="religion"
                                                        value={formData.religion}
                                                        onChange={handleInputChange}
                                                        className="w-full bg-white border border-rose-200 rounded-lg px-4 py-2.5 focus:ring-sky-500 font-medium text-slate-700 text-sm appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2232%22%20height%3D%2232%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:1.25em_1.25em] bg-[right_0.75rem_center] bg-no-repeat"
                                                    >
                                                        <option value="">请选择 Please Choose</option>
                                                        <option value="None">None</option>
                                                        <option value="Christianity">Christianity</option>
                                                        <option value="Islam">Islam</option>
                                                        <option value="Buddhism">Buddhism</option>
                                                        <option value="Hinduism">Hinduism</option>
                                                    </select>
                                                </div>

                                                {/* Occupation */}
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold text-sky-600 uppercase tracking-wider flex items-center gap-1">职业 Occupation <span className="text-rose-500">*</span></label>
                                                    <select
                                                        name="occupation"
                                                        value={formData.occupation}
                                                        onChange={handleInputChange}
                                                        className="w-full bg-white border border-rose-200 rounded-lg px-4 py-2.5 focus:ring-sky-500 font-medium text-slate-700 text-sm appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2232%22%20height%3D%2232%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:1.25em_1.25em] bg-[right_0.75rem_center] bg-no-repeat"
                                                    >
                                                        <option value="">请选择 Please Choose</option>
                                                        {OCCUPATIONS.map(o => (
                                                            <option key={o.value} value={o.value}>{o.name}</option>
                                                        ))}
                                                    </select>
                                                </div>

                                                {/* Employer or Institution */}
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold text-sky-600 uppercase tracking-wider flex items-center gap-1">工作或学习单位 Employer or Institution Affiliated <Info className="w-3.5 h-3.5 text-sky-400" /> <span className="text-rose-500">*</span></label>
                                                    <input
                                                        type="text"
                                                        name="employerOrInstitution"
                                                        value={formData.employerOrInstitution}
                                                        onChange={handleInputChange}
                                                        className="w-full bg-white border border-rose-200 rounded-lg px-5 py-2.5 focus:ring-sky-500 font-medium text-slate-700 text-sm shadow-sm"
                                                        placeholder="Employer or Institution Affiliated"
                                                    />
                                                </div>

                                                {/* Years of Living */}
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold text-sky-600 uppercase tracking-wider flex items-center gap-1">在本国生活年限 Years of Living in Your Home Country <span className="text-rose-500">*</span></label>
                                                    <input
                                                        type="text"
                                                        name="yearsOfLivingInHomeCountry"
                                                        value={formData.yearsOfLivingInHomeCountry}
                                                        onChange={handleInputChange}
                                                        className="w-full bg-white border border-rose-200 rounded-lg px-5 py-2.5 focus:ring-sky-500 font-medium text-slate-700 text-sm shadow-sm"
                                                        placeholder="Years of living in your own country"
                                                    />
                                                </div>

                                                {/* Wechat */}
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold text-sky-600 uppercase tracking-wider flex items-center gap-1">微信 Wechat</label>
                                                    <input
                                                        type="text"
                                                        name="wechat"
                                                        value={formData.wechat}
                                                        onChange={handleInputChange}
                                                        className="w-full bg-white border border-slate-200 rounded-lg px-5 py-2.5 focus:ring-sky-500 font-medium text-slate-700 text-sm shadow-sm"
                                                        placeholder="Wechat"
                                                    />
                                                </div>

                                                {/* Skype */}
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold text-[#1E293B] uppercase tracking-wider flex items-center gap-1">SKYPE</label>
                                                    <input
                                                        type="text"
                                                        name="skype"
                                                        value={formData.skype}
                                                        onChange={handleInputChange}
                                                        className="w-full bg-white border border-slate-200 rounded-lg px-5 py-2.5 focus:ring-sky-500 font-medium text-slate-700 text-sm shadow-sm"
                                                        placeholder="Skype"
                                                    />
                                                </div>

                                                {/* Chinese Descent */}
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold text-sky-600 uppercase tracking-wider flex items-center gap-1">是否华裔 Are you of Chinese descent?</label>
                                                    <div className="flex gap-6 mt-1">
                                                        {['Yes', 'No'].map(v => (
                                                            <label key={v} className="flex items-center gap-2.5 cursor-pointer group">
                                                                <div className="relative flex items-center justify-center">
                                                                    <input
                                                                        type="radio"
                                                                        name="isChineseDescent"
                                                                        value={v}
                                                                        checked={formData.isChineseDescent === v}
                                                                        onChange={handleInputChange}
                                                                        className="peer appearance-none w-5 h-5 border-2 border-slate-200 rounded-full checked:border-sky-500 transition-all"
                                                                    />
                                                                    <div className="absolute w-2.5 h-2.5 bg-sky-500 rounded-full scale-0 peer-checked:scale-100 transition-all"></div>
                                                                </div>
                                                                <span className={`text-sm font-bold ${formData.isChineseDescent === v ? 'text-sky-600' : 'text-slate-500'}`}>
                                                                    {v}
                                                                </span>
                                                            </label>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* SECTION 2: CORRESPONDENCE ADDRESS */}
                                <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 overflow-hidden border border-slate-100 animate-slideUp" style={{ animationDelay: '100ms' }}>
                                    <div className="bg-[#0EA5E9] px-8 py-5 flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center backdrop-blur-sm">
                                            <Diamond className="w-4 h-4 text-white fill-white" />
                                        </div>
                                        <h3 className="text-white font-bold text-xl uppercase tracking-tight">通讯地址 Correspondence Address</h3>
                                    </div>

                                    <div className="p-8 lg:p-10 flex flex-col lg:flex-row gap-12">
                                        {/* Left Column: Home Address */}
                                        <div className="flex-1 space-y-6">
                                            <h4 className="text-rose-500 font-bold text-lg flex items-center gap-2">家庭地址 Home Address</h4>

                                            {/* Home Detailed Address */}
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-sky-600 uppercase tracking-wider flex items-center gap-1">
                                                    详细地址 Detailed Address <span className="text-rose-500">*</span> <Info className="w-4 h-4 text-sky-400" />
                                                </label>
                                                <input
                                                    type="text"
                                                    name="homeDetailedAddress"
                                                    value={formData.homeDetailedAddress}
                                                    onChange={handleInputChange}
                                                    className="w-full bg-white border border-rose-200 rounded-lg px-4 py-2.5 focus:ring-sky-500 font-medium text-slate-700 text-sm shadow-sm placeholder:text-slate-300"
                                                    placeholder="Detailed address include house number, buildings, street and city name, etc."
                                                />
                                            </div>

                                            {/* Home Province/City */}
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-sky-600 uppercase tracking-wider flex items-center gap-1">
                                                    省/城市 Province/City<span className="text-rose-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    name="homeCityProvince"
                                                    value={formData.homeCityProvince}
                                                    onChange={handleInputChange}
                                                    className="w-full bg-white border border-rose-200 rounded-lg px-4 py-2.5 focus:ring-sky-500 font-medium text-slate-700 text-sm shadow-sm"
                                                    placeholder="Province/City"
                                                />
                                            </div>

                                            {/* Home Country */}
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-sky-600 uppercase tracking-wider flex items-center gap-1">
                                                    国家 Country<span className="text-rose-500">*</span>
                                                </label>
                                                <div className="relative">
                                                    <select
                                                        name="homeCountry"
                                                        value={formData.homeCountry}
                                                        onChange={handleInputChange}
                                                        className="w-full bg-white border border-rose-200 rounded-lg px-4 py-2.5 focus:ring-sky-500 font-bold text-[#4F46E5] text-sm appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2232%22%20height%3D%2232%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:1.25em_1.25em] bg-[right_0.75rem_center] bg-no-repeat"
                                                    >
                                                        <option value="">Please select...</option>
                                                        {COUNTRIES.map(c => (
                                                            <option key={c.name} value={c.name}>{c.name}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>

                                            {/* Home Zipcode */}
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-sky-600 uppercase tracking-wider flex items-center gap-1">
                                                    邮编 Zipcode<span className="text-rose-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    name="homeZipcode"
                                                    value={formData.homeZipcode}
                                                    onChange={handleInputChange}
                                                    className="w-full bg-white border border-rose-200 rounded-lg px-4 py-2.5 focus:ring-sky-500 font-medium text-slate-700 text-sm shadow-sm"
                                                    placeholder="Zipcode"
                                                />
                                            </div>

                                            {/* Home Phone or Mobile */}
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-sky-600 uppercase tracking-wider flex items-center gap-1">
                                                    电话/手机 Phone or Mobile<span className="text-rose-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    name="homePhone"
                                                    value={formData.homePhone}
                                                    onChange={handleInputChange}
                                                    className="w-full bg-white border border-rose-200 rounded-lg px-4 py-2.5 focus:ring-sky-500 font-medium text-slate-700 text-sm shadow-sm"
                                                    placeholder="Mobile/Phone Number"
                                                />
                                            </div>

                                            {/* Home Main Email */}
                                            <div className="space-y-3">
                                                <label className="text-xs font-bold text-sky-600 uppercase tracking-wider flex items-center gap-1">
                                                    常用邮箱 Main Email<span className="text-rose-500">*</span>
                                                </label>
                                                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 space-y-4">
                                                    <div className="bg-white/50 rounded-xl p-4 border border-dashed border-slate-200">
                                                        <p className="text-[11px] font-bold text-slate-700 leading-normal">此邮箱用于学校发送消息，不支持Gmail。</p>
                                                        <p className="text-[10px] text-slate-500 leading-normal">It is used for receiving application updates. Gmail is not supported.</p>
                                                    </div>
                                                    <input
                                                        type="email"
                                                        name="homeMainEmail"
                                                        value={formData.homeMainEmail}
                                                        onChange={handleInputChange}
                                                        className="w-full bg-white border border-slate-200 rounded-lg px-5 py-3 font-bold text-[#4F46E5] text-sm shadow-sm"
                                                        placeholder="email@example.com"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right Column: Current Address */}
                                        <div className="flex-1 space-y-6">
                                            <div className="flex items-center justify-between">
                                                <h4 className="text-rose-500 font-bold text-lg">当前地址 Current Address</h4>
                                                <label className="flex items-center gap-2 cursor-pointer group">
                                                    <div className="relative flex items-center justify-center">
                                                        <input
                                                            type="checkbox"
                                                            name="isCurrentSameAsHome"
                                                            checked={formData.isCurrentSameAsHome}
                                                            onChange={handleInputChange}
                                                            className="peer appearance-none w-5 h-5 border-2 border-slate-200 rounded-full checked:border-sky-500 transition-all"
                                                        />
                                                        <div className="absolute w-2.5 h-2.5 bg-sky-500 rounded-full scale-0 peer-checked:scale-100 transition-all"></div>
                                                    </div>
                                                    <span className="text-xs font-bold text-sky-600 group-hover:text-sky-500 transition-colors">与本国家庭通讯地址相同 The same as home address</span>
                                                </label>
                                            </div>

                                            {/* Current Address */}
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-sky-600 uppercase tracking-wider flex items-center gap-1">
                                                    现住址 Current Address<span className="text-rose-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    name="currentDetailedAddress"
                                                    value={formData.currentDetailedAddress}
                                                    disabled={formData.isCurrentSameAsHome}
                                                    onChange={handleInputChange}
                                                    className={`w-full bg-white border ${formData.isCurrentSameAsHome ? 'border-slate-100 bg-slate-50' : 'border-rose-200'} rounded-lg px-4 py-2.5 focus:ring-sky-500 font-medium text-slate-700 text-sm shadow-sm`}
                                                    placeholder="Address"
                                                />
                                            </div>

                                            {/* Current Province/City */}
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-sky-600 uppercase tracking-wider flex items-center gap-1">
                                                    省/城市 Province/City<span className="text-rose-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    name="currentCityProvince"
                                                    value={formData.currentCityProvince}
                                                    disabled={formData.isCurrentSameAsHome}
                                                    onChange={handleInputChange}
                                                    className={`w-full bg-white border ${formData.isCurrentSameAsHome ? 'border-slate-100 bg-slate-50' : 'border-rose-200'} rounded-lg px-4 py-2.5 focus:ring-sky-500 font-medium text-slate-700 text-sm shadow-sm`}
                                                    placeholder="Province/City"
                                                />
                                            </div>

                                            {/* Current Country */}
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-sky-600 uppercase tracking-wider flex items-center gap-1">
                                                    国家 Country<span className="text-rose-500">*</span>
                                                </label>
                                                <div className="relative">
                                                    <select
                                                        name="currentCountry"
                                                        value={formData.currentCountry}
                                                        disabled={formData.isCurrentSameAsHome}
                                                        onChange={handleInputChange}
                                                        className={`w-full bg-white border ${formData.isCurrentSameAsHome ? 'border-slate-100 bg-slate-50' : 'border-rose-200'} rounded-lg px-4 py-2.5 focus:ring-sky-500 font-bold text-[#4F46E5] text-sm appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2232%22%20height%3D%2232%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:1.25em_1.25em] bg-[right_0.75rem_center] bg-no-repeat`}
                                                    >
                                                        <option value="">Please select...</option>
                                                        {COUNTRIES.map(c => (
                                                            <option key={c.name} value={c.name}>{c.name}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>

                                            {/* Current Zipcode */}
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-sky-600 uppercase tracking-wider flex items-center gap-1">
                                                    邮编 Zipcode<span className="text-rose-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    name="currentZipcode"
                                                    value={formData.currentZipcode}
                                                    disabled={formData.isCurrentSameAsHome}
                                                    onChange={handleInputChange}
                                                    className={`w-full bg-white border ${formData.isCurrentSameAsHome ? 'border-slate-100 bg-slate-50' : 'border-rose-200'} rounded-lg px-4 py-2.5 focus:ring-sky-500 font-medium text-slate-700 text-sm shadow-sm`}
                                                    placeholder="Zipcode"
                                                />
                                            </div>

                                            {/* Current Phone or Mobile */}
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-sky-600 uppercase tracking-wider flex items-center gap-1">
                                                    电话/手机 Phone or Mobile<span className="text-rose-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    name="currentPhone"
                                                    value={formData.currentPhone}
                                                    disabled={formData.isCurrentSameAsHome}
                                                    onChange={handleInputChange}
                                                    className={`w-full bg-white border ${formData.isCurrentSameAsHome ? 'border-slate-100 bg-slate-50' : 'border-rose-200'} rounded-lg px-4 py-2.5 focus:ring-sky-500 font-medium text-slate-700 text-sm shadow-sm`}
                                                    placeholder="Mobile"
                                                />
                                            </div>

                                            {/* Current Email */}
                                            <div className="space-y-3">
                                                <label className="text-xs font-bold text-sky-600 uppercase tracking-wider flex items-center gap-1">
                                                    学生邮箱 Email<span className="text-rose-500">*</span>
                                                </label>
                                                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 space-y-4">
                                                    <div className="bg-white/50 rounded-xl p-4 border border-dashed border-slate-200">
                                                        <p className="text-[11px] font-bold text-slate-700 leading-normal">请填写准确的邮箱，此邮箱将用于接收重要信息，例如：JW202/DQ表。</p>
                                                        <p className="text-[10px] text-slate-500 leading-normal">Please enter correct email address, which will be used to receive important updates, for example: JW202/DQ form.</p>
                                                    </div>
                                                    <input
                                                        type="email"
                                                        name="currentEmail"
                                                        value={formData.currentEmail}
                                                        disabled={formData.isCurrentSameAsHome}
                                                        onChange={handleInputChange}
                                                        className={`w-full bg-white border ${formData.isCurrentSameAsHome ? 'border-slate-100 bg-slate-50' : 'border-slate-200'} rounded-lg px-5 py-3 font-bold text-[#4F46E5] text-sm shadow-sm`}
                                                        placeholder="email@example.com"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* SECTION: MAILING ADDRESS FOR ADMISSION NOTICE */}
                                <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 overflow-hidden border border-slate-100 animate-slideUp" style={{ animationDelay: '150ms' }}>
                                    <div className="bg-[#0EA5E9] px-8 py-5 flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center backdrop-blur-sm">
                                            <Diamond className="w-4 h-4 text-white fill-white" />
                                        </div>
                                        <h3 className="text-white font-bold text-xl uppercase tracking-tight">通知书邮寄地址 Mailing Address for Admission Notice</h3>
                                    </div>

                                    <div className="p-8 lg:p-10 space-y-8">
                                        {/* Instruction Note */}
                                        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 space-y-2">
                                            <p className="text-[13px] font-bold text-slate-700 leading-normal">邮寄地址填写说明:请确保邮寄地址（必须包含收件人姓名、联系电话、详细地址、城市.国家和邮编内容）三至六个月内有效，以便接受录取通知书、签证申请表等重要文件</p>
                                            <p className="text-[12px] text-slate-500 leading-normal">Please note: Please make sure the postal address you provided is valid in at least 3 months in order to receive all admission documents successfully.</p>
                                        </div>

                                        {/* Sync Options Grid */}
                                        <div className="flex flex-wrap gap-8">
                                            {[
                                                { label: '与本国家庭通讯地址相同 The same as home address', value: 'Home' },
                                                { label: '与申请人当前联系方式相同 The same as the current postal address', value: 'Current' },
                                                { label: '自取 I will pick up by myself', value: 'Self' }
                                            ].map(opt => (
                                                <label key={opt.value} className="flex items-center gap-3 cursor-pointer group">
                                                    <div className="relative flex items-center justify-center">
                                                        <input
                                                            type="radio"
                                                            name="mailingSyncOption"
                                                            value={opt.value}
                                                            checked={formData.mailingSyncOption === opt.value}
                                                            onChange={handleInputChange}
                                                            className="peer appearance-none w-5 h-5 border-2 border-slate-200 rounded-full checked:border-sky-500 transition-all"
                                                        />
                                                        <div className="absolute w-2.5 h-2.5 bg-sky-500 rounded-full scale-0 peer-checked:scale-100 transition-all"></div>
                                                    </div>
                                                    <span className={`text-[11px] font-bold transition-colors ${formData.mailingSyncOption === opt.value ? 'text-sky-600' : 'text-slate-500 group-hover:text-sky-400'}`}>
                                                        {opt.label}
                                                    </span>
                                                </label>
                                            ))}
                                        </div>

                                        {/* Two-Column Grid for Address Fields */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                                            {/* Receiver's Name */}
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-sky-600 uppercase tracking-wider">收件人姓名 Receiver's Name<span className="text-rose-500">*</span></label>
                                                <input
                                                    type="text"
                                                    name="mailingReceiverName"
                                                    value={formData.mailingReceiverName}
                                                    disabled={formData.mailingSyncOption !== 'None'}
                                                    onChange={handleInputChange}
                                                    className={`w-full bg-white border ${formData.mailingSyncOption !== 'None' ? 'border-slate-100 bg-slate-50' : 'border-rose-200'} rounded-lg px-4 py-2.5 font-medium text-slate-700 text-sm shadow-sm`}
                                                    placeholder="Receiver's Name"
                                                />
                                            </div>

                                            {/* Phone or Mobile */}
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-sky-600 uppercase tracking-wider">收件人手机 Phone or Mobile<span className="text-rose-500">*</span></label>
                                                <input
                                                    type="text"
                                                    name="mailingPhone"
                                                    value={formData.mailingPhone}
                                                    disabled={formData.mailingSyncOption !== 'None'}
                                                    onChange={handleInputChange}
                                                    className={`w-full bg-white border ${formData.mailingSyncOption !== 'None' ? 'border-slate-100 bg-slate-50' : 'border-rose-200'} rounded-lg px-4 py-2.5 font-medium text-slate-700 text-sm shadow-sm`}
                                                    placeholder="Phone or Mobile"
                                                />
                                            </div>

                                            {/* Province/City */}
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-sky-600 uppercase tracking-wider">收件人省/城市 Province/City<span className="text-rose-500">*</span></label>
                                                <input
                                                    type="text"
                                                    name="mailingProvinceCity"
                                                    value={formData.mailingProvinceCity}
                                                    disabled={formData.mailingSyncOption !== 'None'}
                                                    onChange={handleInputChange}
                                                    className={`w-full bg-white border ${formData.mailingSyncOption !== 'None' ? 'border-slate-100 bg-slate-50' : 'border-rose-200'} rounded-lg px-4 py-2.5 font-medium text-slate-700 text-sm shadow-sm`}
                                                    placeholder="Receiver's Province/City"
                                                />
                                            </div>

                                            {/* Country */}
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-sky-600 uppercase tracking-wider">收件人国家 Country<span className="text-rose-500">*</span></label>
                                                <div className="relative">
                                                    <select
                                                        name="mailingCountry"
                                                        value={formData.mailingCountry}
                                                        disabled={formData.mailingSyncOption !== 'None'}
                                                        onChange={handleInputChange}
                                                        className={`w-full bg-white border ${formData.mailingSyncOption !== 'None' ? 'border-slate-100 bg-slate-50' : 'border-rose-200'} rounded-lg px-4 py-2.5 focus:ring-sky-500 font-bold text-[#4F46E5] text-sm appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2232%22%20height%3D%2232%22%20viewBox%200%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:1.25em_1.25em] bg-[right_0.75rem_center] bg-no-repeat`}
                                                    >
                                                        <option value="">Please select...</option>
                                                        {COUNTRIES.map(c => (
                                                            <option key={c.name} value={c.name}>{c.name}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>

                                            {/* Detailed Address */}
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-sky-600 uppercase tracking-wider">收件人地址 Detailed Address<span className="text-rose-500">*</span></label>
                                                <input
                                                    type="text"
                                                    name="mailingDetailedAddress"
                                                    value={formData.mailingDetailedAddress}
                                                    disabled={formData.mailingSyncOption !== 'None'}
                                                    onChange={handleInputChange}
                                                    className={`w-full bg-white border ${formData.mailingSyncOption !== 'None' ? 'border-slate-100 bg-slate-50' : 'border-rose-200'} rounded-lg px-4 py-2.5 font-medium text-slate-700 text-sm shadow-sm`}
                                                    placeholder="Receiver's Address"
                                                />
                                            </div>

                                            {/* Zipcode */}
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-sky-600 uppercase tracking-wider">邮编 Zipcode<span className="text-rose-500">*</span></label>
                                                <input
                                                    type="text"
                                                    name="mailingZipcode"
                                                    value={formData.mailingZipcode}
                                                    disabled={formData.mailingSyncOption !== 'None'}
                                                    onChange={handleInputChange}
                                                    className={`w-full bg-white border ${formData.mailingSyncOption !== 'None' ? 'border-slate-100 bg-slate-50' : 'border-rose-200'} rounded-lg px-4 py-2.5 font-medium text-slate-700 text-sm shadow-sm`}
                                                    placeholder="Zipcode"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* SECTION 3: PASSPORT AND VISA INFORMATION */}
                                <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 overflow-hidden border border-slate-100 animate-slideUp" style={{ animationDelay: '250ms' }}>
                                    <div className="bg-[#0EA5E9] px-8 py-5 flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center backdrop-blur-sm">
                                            <Diamond className="w-4 h-4 text-white fill-white" />
                                        </div>
                                        <h3 className="text-white font-bold text-xl uppercase tracking-tight">证照信息 Passport and Visa Information</h3>
                                    </div>

                                    <div className="p-8 lg:p-10 space-y-8">
                                        {/* Passport Status Radio */}
                                        <div className="space-y-3">
                                            <div className="flex flex-wrap gap-8">
                                                {[
                                                    { label: '有护照:I have passport', value: 'I have passport' },
                                                    { label: '暂未办理护照:I don\'t have passport.', value: 'I don\'t have passport' }
                                                ].map(opt => (
                                                    <label key={opt.value} className="flex items-center gap-3 cursor-pointer group">
                                                        <div className="relative flex items-center justify-center">
                                                            <input
                                                                type="radio"
                                                                name="hasPassport"
                                                                value={opt.value}
                                                                checked={formData.hasPassport === opt.value}
                                                                onChange={handleInputChange}
                                                                className="peer appearance-none w-5 h-5 border-2 border-slate-200 rounded-full checked:border-sky-500 transition-all"
                                                            />
                                                            <div className="absolute w-2.5 h-2.5 bg-sky-500 rounded-full scale-0 peer-checked:scale-100 transition-all"></div>
                                                        </div>
                                                        <span className={`text-[11px] font-bold transition-colors ${formData.hasPassport === opt.value ? 'text-sky-600' : 'text-slate-500 group-hover:text-sky-400'}`}>
                                                            {opt.label}
                                                        </span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-8">
                                            {/* Passport Number */}
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-sky-600 uppercase tracking-wider flex items-center gap-1">
                                                    护照号码 Passport No. <span className="text-rose-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    name="passportNo"
                                                    value={formData.passportNo}
                                                    onChange={handleInputChange}
                                                    className="w-full bg-white border border-rose-200 rounded-lg px-4 py-2.5 focus:ring-sky-500 font-bold text-[#4F46E5] text-sm shadow-sm placeholder:text-slate-300"
                                                    placeholder="APPLY1768213792000"
                                                />
                                            </div>

                                            {/* Passport Expiry Date Range */}
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-sky-600 uppercase tracking-wider">
                                                    护照有效期 Passport Expiry Date <span className="text-rose-500">*</span>
                                                </label>
                                                <div className="flex items-center gap-2">
                                                    <div className="flex-1">
                                                        <input
                                                            type="date"
                                                            name="passportStartDate"
                                                            value={formData.passportStartDate}
                                                            onChange={handleInputChange}
                                                            className="w-full bg-white border border-rose-200 rounded-lg px-4 py-2.5 focus:ring-sky-500 font-medium text-slate-700 text-sm shadow-sm"
                                                            placeholder="Passport start date"
                                                        />
                                                    </div>
                                                    <span className="text-slate-400">-</span>
                                                    <div className="flex-1">
                                                        <input
                                                            type="date"
                                                            name="passportExpiryDate"
                                                            value={formData.passportExpiryDate}
                                                            onChange={handleInputChange}
                                                            className="w-full bg-white border border-rose-200 rounded-lg px-4 py-2.5 focus:ring-sky-500 font-medium text-slate-700 text-sm shadow-sm"
                                                            placeholder="Passport Expire at"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Old Passport No. */}
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-sky-600 uppercase tracking-wider">
                                                    旧护照号码 Old Passport No.
                                                </label>
                                                <input
                                                    type="text"
                                                    name="oldPassportNo"
                                                    value={formData.oldPassportNo}
                                                    onChange={handleInputChange}
                                                    className="w-full bg-white border border-rose-200 rounded-lg px-4 py-2.5 focus:ring-sky-500 font-medium text-slate-700 text-sm shadow-sm placeholder:text-slate-300"
                                                    placeholder="OLD PASSPORT NO."
                                                />
                                            </div>

                                            {/* Expiration of Old Passport */}
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-sky-600 uppercase tracking-wider">
                                                    旧护照到期时间 Expiration of Old Passport
                                                </label>
                                                <input
                                                    type="date"
                                                    name="oldPassportExpiryDate"
                                                    value={formData.oldPassportExpiryDate}
                                                    onChange={handleInputChange}
                                                    className="w-full bg-white border border-rose-200 rounded-lg px-4 py-2.5 focus:ring-sky-500 font-medium text-slate-700 text-sm shadow-sm"
                                                />
                                            </div>
                                        </div>

                                        {/* Embassy Selection */}
                                        <div className="space-y-4 pt-4 border-t border-slate-100">
                                            <label className="text-xs font-bold text-sky-600 uppercase tracking-wider block">
                                                签证申请所在大使馆或领事馆 Which Chinese embassy or consulate would you apply visa at <span className="text-rose-500">*</span>
                                            </label>
                                            <div className="space-y-3">
                                                <div className="relative">
                                                    <select
                                                        name="applyVisaCountry"
                                                        value={formData.applyVisaCountry}
                                                        onChange={handleInputChange}
                                                        className="w-full bg-white border border-rose-200 rounded-lg px-4 py-2.5 focus:ring-sky-500 font-bold text-[#4F46E5] text-sm appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2232%22%20height%3D%2232%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:1.25em_1.25em] bg-[right_0.75rem_center] bg-no-repeat"
                                                    >
                                                        <option value="">请选择 Please Choose</option>
                                                        {COUNTRIES.map(c => (
                                                            <option key={c.name} value={c.name}>{c.name}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div className="relative">
                                                    <select
                                                        name="applyVisaEmbassy"
                                                        value={formData.applyVisaEmbassy}
                                                        onChange={handleInputChange}
                                                        className="w-full bg-white border border-rose-200 rounded-lg px-4 py-2.5 focus:ring-sky-500 font-bold text-[#4F46E5] text-sm appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2232%22%20height%3D%2232%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:1.25em_1.25em] bg-[right_0.75rem_center] bg-no-repeat"
                                                    >
                                                        <option value="">请选择 Please Choose</option>
                                                        <option value="Embassy of the People's Republic of China">Embassy of the People's Republic of China</option>
                                                        <option value="Consulate-General of the People's Republic of China">Consulate-General of the People's Republic of China</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* SECTION: LEARNING EXPERIENCE IN CHINA */}
                                <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 overflow-hidden border border-slate-100 animate-slideUp" style={{ animationDelay: '300ms' }}>
                                    <div className="bg-[#0EA5E9] px-8 py-5 flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center backdrop-blur-sm">
                                            <Diamond className="w-4 h-4 text-white fill-white" />
                                        </div>
                                        <h3 className="text-white font-bold text-xl uppercase tracking-tight">在华学习经历 Learning Experience In China</h3>
                                    </div>

                                    <div className="p-8 lg:p-10 space-y-8">
                                        {/* Instruction Note */}
                                        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 space-y-2">
                                            <p className="text-[13px] font-bold text-slate-700 leading-normal">说明:目前在中国境内的申请者，需要在上传护照栏目提交签证页、居留许可页以及入境章页</p>
                                            <p className="text-[12px] text-slate-500 leading-normal">Note: Applicants currently in China need to submit the visa page, residence permit page and entry stamp page</p>
                                        </div>

                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-8">
                                            {/* studied in China? */}
                                            <div className="space-y-4">
                                                <label className="text-xs font-bold text-sky-600 uppercase tracking-wider block">
                                                    是否曾经或当前在中国学习 Have you studied or whether studying in China currently? <span className="text-rose-500">*</span>
                                                </label>
                                                <div className="flex gap-6">
                                                    {['Yes', 'No'].map(opt => (
                                                        <label key={opt} className="flex items-center gap-3 cursor-pointer group">
                                                            <div className="relative flex items-center justify-center">
                                                                <input
                                                                    type="radio"
                                                                    name="hasStudiedInChina"
                                                                    value={opt}
                                                                    checked={formData.hasStudiedInChina === opt}
                                                                    onChange={handleInputChange}
                                                                    className="peer appearance-none w-5 h-5 border-2 border-slate-200 rounded-full checked:border-sky-500 transition-all"
                                                                />
                                                                <div className="absolute w-2.5 h-2.5 bg-sky-500 rounded-full scale-0 peer-checked:scale-100 transition-all"></div>
                                                            </div>
                                                            <span className={`text-[11px] font-bold ${formData.hasStudiedInChina === opt ? 'text-sky-600' : 'text-slate-500'}`}>{opt}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* in China now? */}
                                            <div className="space-y-4">
                                                <label className="text-xs font-bold text-sky-600 uppercase tracking-wider block">
                                                    当前是否在中国 Whether in China now? <span className="text-rose-500">*</span>
                                                </label>
                                                <div className="flex gap-6">
                                                    {['Yes', 'No'].map(opt => (
                                                        <label key={opt} className="flex items-center gap-3 cursor-pointer group">
                                                            <div className="relative flex items-center justify-center">
                                                                <input
                                                                    type="radio"
                                                                    name="isInChinaNow"
                                                                    value={opt}
                                                                    checked={formData.isInChinaNow === opt}
                                                                    onChange={handleInputChange}
                                                                    className="peer appearance-none w-5 h-5 border-2 border-slate-200 rounded-full checked:border-sky-500 transition-all"
                                                                />
                                                                <div className="absolute w-2.5 h-2.5 bg-sky-500 rounded-full scale-0 peer-checked:scale-100 transition-all"></div>
                                                            </div>
                                                            <span className={`text-[11px] font-bold ${formData.isInChinaNow === opt ? 'text-sky-600' : 'text-slate-500'}`}>{opt}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Visa Type */}
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-sky-600 uppercase tracking-wider block">签证类型 Visa Type</label>
                                                <div className="relative">
                                                    <select
                                                        name="chinaVisaType"
                                                        value={formData.chinaVisaType}
                                                        onChange={handleInputChange}
                                                        className="w-full bg-white border border-rose-200 rounded-lg px-4 py-2.5 focus:ring-sky-500 font-bold text-[#4F46E5] text-sm appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2232%22%20height%3D%2232%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:1.25em_1.25em] bg-[right_0.75rem_center] bg-no-repeat"
                                                    >
                                                        <option value="">请选择 Please Choose</option>
                                                        <option value="X1">X1 (Long-term Study)</option>
                                                        <option value="X2">X2 (Short-term Study)</option>
                                                        <option value="L">L (Tourist)</option>
                                                        <option value="S1/S2">S1/S2 (Private Visit)</option>
                                                        <option value="Z">Z (Work)</option>
                                                    </select>
                                                </div>
                                            </div>

                                            {/* Visa Expiry Date */}
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-sky-600 uppercase tracking-wider block">签证到期时间 Expiry Date</label>
                                                <input
                                                    type="date"
                                                    name="chinaVisaExpiryDate"
                                                    value={formData.chinaVisaExpiryDate}
                                                    onChange={handleInputChange}
                                                    className="w-full bg-white border border-rose-200 rounded-lg px-4 py-2.5 focus:ring-sky-500 font-medium text-slate-700 text-sm shadow-sm"
                                                    placeholder="When will your current visa expire"
                                                />
                                            </div>

                                            {/* Duration Range */}
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-sky-600 uppercase tracking-wider block">在华学习期限 Duration of study in China</label>
                                                <div className="flex items-center gap-2">
                                                    <div className="flex-1">
                                                        <input
                                                            type="date"
                                                            name="chinaStudyStartDate"
                                                            value={formData.chinaStudyStartDate}
                                                            onChange={handleInputChange}
                                                            className="w-full bg-white border border-rose-200 rounded-lg px-4 py-2.5 font-medium text-slate-700 text-sm shadow-sm"
                                                            placeholder="Start of study in China"
                                                        />
                                                    </div>
                                                    <span className="text-slate-400">-</span>
                                                    <div className="flex-1">
                                                        <input
                                                            type="date"
                                                            name="chinaStudyEndDate"
                                                            value={formData.chinaStudyEndDate}
                                                            onChange={handleInputChange}
                                                            className="w-full bg-white border border-rose-200 rounded-lg px-4 py-2.5 font-medium text-slate-700 text-sm shadow-sm"
                                                            placeholder="Deadline to study in China"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Institution */}
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-sky-600 uppercase tracking-wider block">在华学习院校 The institution in China that you have studied in</label>
                                                <input
                                                    type="text"
                                                    name="chinaInstitution"
                                                    value={formData.chinaInstitution}
                                                    onChange={handleInputChange}
                                                    className="w-full bg-white border border-rose-200 rounded-lg px-4 py-2.5 focus:ring-sky-500 font-medium text-slate-700 text-sm shadow-sm"
                                                    placeholder="Institution name"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* SECTION 4: FINANCIAL SPONSOR'S INFORMATION */}
                                <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 overflow-hidden border border-slate-100 animate-slideUp" style={{ animationDelay: '350ms' }}>
                                    <div className="bg-[#0EA5E9] px-8 py-5 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center backdrop-blur-sm">
                                                <Diamond className="w-4 h-4 text-white fill-white" />
                                            </div>
                                            <h3 className="text-white font-bold text-xl">经济担保人信息 Financial Sponsor's Information <span className="text-rose-200">*</span></h3>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setShowSponsorForm(true)}
                                            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all font-bold text-sm border border-white/20"
                                        >
                                            <Plus className="w-4 h-4" /> 添加 Add
                                        </button>
                                    </div>

                                    <div className="p-8 lg:p-10 space-y-8">
                                        {/* Sponsors Table */}
                                        <div className="overflow-hidden border border-slate-100 rounded-2xl shadow-sm">
                                            <table className="w-full text-left border-collapse">
                                                <thead>
                                                    <tr className="bg-slate-50/80 border-b border-slate-100">
                                                        <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center border-r border-slate-100">姓名<br />Name</th>
                                                        <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center border-r border-slate-100">关系<br />Relationship</th>
                                                        <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center border-r border-slate-100">国籍<br />Nationality</th>
                                                        <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center border-r border-slate-100">单位名称<br />Work Place</th>
                                                        <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center border-r border-slate-100">职业<br />Occupation</th>
                                                        <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center border-r border-slate-100">联系电话<br />Phone/Mobile</th>
                                                        <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center border-r border-slate-100">联系邮箱<br />Email</th>
                                                        <th className="px-6 py-4 text-[10px] font-bold text-[#0EA5E9] uppercase tracking-wider text-center">操作</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-50">
                                                    {formData.financialSponsors.length === 0 ? (
                                                        <tr>
                                                            <td colSpan="8" className="px-6 py-12 text-center text-slate-400 font-medium italic">
                                                                No sponsors added yet. Click "Add" to provide details.
                                                            </td>
                                                        </tr>
                                                    ) : (
                                                        formData.financialSponsors.map((s) => (
                                                            <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                                                                <td className="px-6 py-4 text-sm font-bold text-slate-700 text-center border-r border-slate-100">{s.name}</td>
                                                                <td className="px-6 py-4 text-sm text-slate-600 text-center border-r border-slate-100">{s.relationship}</td>
                                                                <td className="px-6 py-4 text-sm text-slate-600 text-center border-r border-slate-100">{s.nationality}</td>
                                                                <td className="px-6 py-4 text-sm text-slate-600 text-center border-r border-slate-100">{s.workPlace}</td>
                                                                <td className="px-6 py-4 text-sm text-slate-600 text-center border-r border-slate-100">{s.occupation}</td>
                                                                <td className="px-6 py-4 text-sm text-slate-600 text-center border-r border-slate-100">{s.phone}</td>
                                                                <td className="px-6 py-4 text-sm text-slate-600 text-center border-r border-slate-100">{s.email}</td>
                                                                <td className="px-6 py-4 text-center">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => removeSponsor(s.id)}
                                                                        className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                                                                    >
                                                                        <Trash2 className="w-4 h-4" />
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        ))
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* Expandable Add Form */}
                                        {showSponsorForm && (
                                            <div className="bg-slate-50/50 border-2 border-dashed border-sky-100 rounded-[2rem] p-8 lg:p-10 animate-fadeIn section-dropdown">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                                    {/* Sponsor Name */}
                                                    <div className="space-y-2">
                                                        <label className="text-xs font-bold text-sky-600 uppercase tracking-wider">姓名 Name <span className="text-rose-500">*</span></label>
                                                        <input
                                                            type="text"
                                                            name="name"
                                                            value={currentSponsor.name}
                                                            onChange={handleSponsorInputChange}
                                                            className="w-full bg-white border border-slate-200 rounded-xl px-5 py-3 focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 font-medium text-slate-700 placeholder:text-slate-300"
                                                            placeholder="Name"
                                                        />
                                                    </div>

                                                    {/* Relationship */}
                                                    <div className="space-y-2">
                                                        <label className="text-xs font-bold text-sky-600 uppercase tracking-wider">关系 Relationship with the student <span className="text-rose-500">*</span></label>
                                                        <select
                                                            name="relationship"
                                                            value={currentSponsor.relationship}
                                                            onChange={handleSponsorInputChange}
                                                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 focus:ring-sky-500 font-medium text-slate-700"
                                                        >
                                                            <option value="">请选择 Please Choose</option>
                                                            {RELATIONSHIPS.map(r => (
                                                                <option key={r.value} value={r.value}>{r.name}</option>
                                                            ))}
                                                        </select>
                                                    </div>

                                                    {/* Work Place */}
                                                    <div className="space-y-2">
                                                        <label className="text-xs font-bold text-sky-600 uppercase tracking-wider">单位名称 Work Place <span className="text-rose-500">*</span></label>
                                                        <input
                                                            type="text"
                                                            name="workPlace"
                                                            value={currentSponsor.workPlace}
                                                            onChange={handleSponsorInputChange}
                                                            className="w-full bg-white border border-slate-200 rounded-xl px-5 py-3 focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 font-medium text-slate-700 placeholder:text-slate-300"
                                                            placeholder="Name of Institute/Employer"
                                                        />
                                                    </div>

                                                    {/* Nationality */}
                                                    <div className="space-y-2">
                                                        <label className="text-xs font-bold text-sky-600 uppercase tracking-wider">国籍 Nationality <span className="text-rose-500">*</span></label>
                                                        <select
                                                            name="nationality"
                                                            value={currentSponsor.nationality}
                                                            onChange={handleSponsorInputChange}
                                                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 focus:ring-sky-500 font-medium text-slate-700"
                                                        >
                                                            <option value="">请选择 Please Choose</option>
                                                            {NATIONALITIES.map(n => (
                                                                <option key={n.value} value={n.value}>{n.name}</option>
                                                            ))}
                                                        </select>
                                                    </div>

                                                    {/* Occupation */}
                                                    <div className="space-y-2">
                                                        <label className="text-xs font-bold text-sky-600 uppercase tracking-wider">职业 Occupation <span className="text-rose-500">*</span></label>
                                                        <select
                                                            name="occupation"
                                                            value={currentSponsor.occupation}
                                                            onChange={handleSponsorInputChange}
                                                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 focus:ring-sky-500 font-medium text-slate-700"
                                                        >
                                                            <option value="">请选择 Please Choose</option>
                                                            {OCCUPATIONS.map(o => (
                                                                <option key={o.value} value={o.value}>{o.name}</option>
                                                            ))}
                                                        </select>
                                                    </div>

                                                    {/* Industry Type */}
                                                    <div className="space-y-2">
                                                        <label className="text-xs font-bold text-sky-600 uppercase tracking-wider">行业类型 Industry Type <span className="text-rose-500">*</span></label>
                                                        <select
                                                            name="industryType"
                                                            value={currentSponsor.industryType}
                                                            onChange={handleSponsorInputChange}
                                                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 focus:ring-sky-500 font-medium text-slate-700"
                                                        >
                                                            <option value="">请选择 Please Choose</option>
                                                            {INDUSTRY_TYPES.map(i => (
                                                                <option key={i.value} value={i.value}>{i.name}</option>
                                                            ))}
                                                        </select>
                                                    </div>

                                                    {/* Email */}
                                                    <div className="space-y-2">
                                                        <label className="text-xs font-bold text-sky-600 uppercase tracking-wider">邮箱 Email <span className="text-rose-500">*</span></label>
                                                        <input
                                                            type="email"
                                                            name="email"
                                                            value={currentSponsor.email}
                                                            onChange={handleSponsorInputChange}
                                                            className="w-full bg-white border border-slate-200 rounded-xl px-5 py-3 focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 font-medium text-slate-700 placeholder:text-slate-300"
                                                            placeholder="Contact Email"
                                                        />
                                                    </div>

                                                    {/* Phone */}
                                                    <div className="space-y-2">
                                                        <label className="text-xs font-bold text-sky-600 uppercase tracking-wider">电话 Phone or Mobile <span className="text-rose-500">*</span></label>
                                                        <input
                                                            type="tel"
                                                            name="phone"
                                                            value={currentSponsor.phone}
                                                            onChange={handleSponsorInputChange}
                                                            className="w-full bg-white border border-slate-200 rounded-xl px-5 py-3 focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 font-medium text-slate-700 placeholder:text-slate-300"
                                                            placeholder="Contact Tel"
                                                        />
                                                    </div>
                                                </div>

                                                {/* Sponsor Form Actions */}
                                                <div className="flex items-center justify-center gap-4 mt-10">
                                                    <button
                                                        type="button"
                                                        onClick={handleAddSponsor}
                                                        className="px-10 py-3 bg-[#0EA5E9] text-white font-bold rounded-xl hover:bg-sky-600 shadow-lg shadow-sky-100 transition-all uppercase tracking-widest text-xs"
                                                    >
                                                        保存 Save
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowSponsorForm(false)}
                                                        className="px-10 py-3 bg-white border-2 border-sky-400 text-sky-500 font-bold rounded-xl hover:bg-sky-50 transition-all uppercase tracking-widest text-xs"
                                                    >
                                                        关闭 Close
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* SECTION 5: EMERGENCY CONTACT */}
                                <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 overflow-hidden border border-slate-100 animate-slideUp" style={{ animationDelay: '400ms' }}>
                                    <div className="bg-[#0EA5E9] px-8 py-5 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center backdrop-blur-sm">
                                                <Phone className="w-4 h-4 text-white" />
                                            </div>
                                            <h3 className="text-white font-bold text-xl">紧急联系人 Emergency Contact <span className="text-rose-200">*</span></h3>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setShowEmergencyForm(true)}
                                            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all font-bold text-sm border border-white/20"
                                        >
                                            <Plus className="w-4 h-4" /> 添加 Add
                                        </button>
                                    </div>

                                    <div className="p-8 lg:p-10 space-y-8">
                                        {/* Emergency Note */}
                                        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6">
                                            <p className="text-sm font-bold text-slate-700">请确保信息真实有效，以便紧急情况取得联系</p>
                                            <p className="text-xs text-slate-500 mt-1">Please make sure the contact information is real and correct in case of emergency.</p>
                                        </div>

                                        {/* Contacts Table */}
                                        <div className="overflow-hidden border border-slate-100 rounded-2xl shadow-sm">
                                            <table className="w-full text-left border-collapse">
                                                <thead>
                                                    <tr className="bg-slate-50/80 border-b border-slate-100">
                                                        <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center border-r border-slate-100">姓名<br />Name</th>
                                                        <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center border-r border-slate-100">关系<br />Relationship</th>
                                                        <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center border-r border-slate-100">单位名称<br />Work Place</th>
                                                        <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center border-r border-slate-100">行业类型<br />Industry Type</th>
                                                        <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center border-r border-slate-100">职业<br />Occupation</th>
                                                        <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center border-r border-slate-100">联系电话<br />Phone/Mobile</th>
                                                        <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center border-r border-slate-100">联系邮箱<br />Email</th>
                                                        <th className="px-6 py-4 text-[10px] font-bold text-[#0EA5E9] uppercase tracking-wider text-center">操作</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-50">
                                                    {formData.emergencyContacts.length === 0 ? (
                                                        <tr>
                                                            <td colSpan="7" className="px-6 py-12 text-center text-slate-400 font-medium italic">
                                                                No emergency contacts added yet.
                                                            </td>
                                                        </tr>
                                                    ) : (
                                                        formData.emergencyContacts.map((c) => (
                                                            <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                                                                <td className="px-6 py-4 text-sm font-bold text-slate-700 text-center border-r border-slate-100">{c.name}</td>
                                                                <td className="px-6 py-4 text-sm text-slate-600 text-center border-r border-slate-100">{c.relationship}</td>
                                                                <td className="px-6 py-4 text-sm text-slate-600 text-center border-r border-slate-100">{c.workPlace}</td>
                                                                <td className="px-6 py-4 text-sm text-slate-600 text-center border-r border-slate-100">{c.industryType}</td>
                                                                <td className="px-6 py-4 text-sm text-slate-600 text-center border-r border-slate-100">{c.occupation}</td>
                                                                <td className="px-6 py-4 text-sm text-slate-600 text-center border-r border-slate-100">{c.phone}</td>
                                                                <td className="px-6 py-4 text-sm text-slate-600 text-center border-r border-slate-100">{c.email}</td>
                                                                <td className="px-6 py-4 text-center">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => removeEmergency(c.id)}
                                                                        className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                                                                    >
                                                                        <Trash2 className="w-4 h-4" />
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        ))
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* Expandable Add Form */}
                                        {showEmergencyForm && (
                                            <div className="bg-slate-50/50 border-2 border-dashed border-sky-100 rounded-[2rem] p-8 lg:p-10 animate-fadeIn section-dropdown">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                                    <div className="space-y-2">
                                                        <label className="text-xs font-bold text-sky-600 uppercase tracking-wider">姓名 Name <span className="text-rose-500">*</span></label>
                                                        <input
                                                            type="text"
                                                            name="name"
                                                            value={currentEmergencyContact.name}
                                                            onChange={handleEmergencyInputChange}
                                                            className="w-full bg-white border border-slate-200 rounded-xl px-5 py-3 focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 font-medium text-slate-700 placeholder:text-slate-300"
                                                            placeholder="Name"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-xs font-bold text-sky-600 uppercase tracking-wider">关系 Relationship with the student <span className="text-rose-500">*</span></label>
                                                        <select
                                                            name="relationship"
                                                            value={currentEmergencyContact.relationship}
                                                            onChange={handleEmergencyInputChange}
                                                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 focus:ring-sky-500 font-medium text-slate-700"
                                                        >
                                                            <option value="">请选择 Please Choose</option>
                                                            {RELATIONSHIPS.map(r => (
                                                                <option key={r.value} value={r.value}>{r.name}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-xs font-bold text-sky-600 uppercase tracking-wider">单位名称 Work Place <span className="text-rose-500">*</span></label>
                                                        <input
                                                            type="text"
                                                            name="workPlace"
                                                            value={currentEmergencyContact.workPlace}
                                                            onChange={handleEmergencyInputChange}
                                                            className="w-full bg-white border border-slate-200 rounded-xl px-5 py-3 focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 font-medium text-slate-700 placeholder:text-slate-300"
                                                            placeholder="Name of Institute/Employer"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-xs font-bold text-sky-600 uppercase tracking-wider">行业类型 Industry Type <span className="text-rose-500">*</span></label>
                                                        <select
                                                            name="industryType"
                                                            value={currentEmergencyContact.industryType}
                                                            onChange={handleEmergencyInputChange}
                                                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 focus:ring-sky-500 font-medium text-slate-700"
                                                        >
                                                            <option value="">请选择 Please Choose</option>
                                                            {INDUSTRY_TYPES.map(i => (
                                                                <option key={i.value} value={i.value}>{i.name}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-xs font-bold text-sky-600 uppercase tracking-wider">职业 Occupation <span className="text-rose-500">*</span></label>
                                                        <select
                                                            name="occupation"
                                                            value={currentEmergencyContact.occupation}
                                                            onChange={handleEmergencyInputChange}
                                                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 focus:ring-sky-500 font-medium text-slate-700"
                                                        >
                                                            <option value="">请选择 Please Choose</option>
                                                            {OCCUPATIONS.map(o => (
                                                                <option key={o.value} value={o.value}>{o.name}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-xs font-bold text-sky-600 uppercase tracking-wider">电话 Phone or Mobile <span className="text-rose-500">*</span></label>
                                                        <input
                                                            type="tel"
                                                            name="phone"
                                                            value={currentEmergencyContact.phone}
                                                            onChange={handleEmergencyInputChange}
                                                            className="w-full bg-white border border-slate-200 rounded-xl px-5 py-3 focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 font-medium text-slate-700 placeholder:text-slate-300"
                                                            placeholder="Contact Tel"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-xs font-bold text-sky-600 uppercase tracking-wider">邮箱 Email <span className="text-rose-500">*</span></label>
                                                        <input
                                                            type="email"
                                                            name="email"
                                                            value={currentEmergencyContact.email}
                                                            onChange={handleEmergencyInputChange}
                                                            className="w-full bg-white border border-slate-200 rounded-xl px-5 py-3 focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 font-medium text-slate-700 placeholder:text-slate-300"
                                                            placeholder="Contact Email"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-center gap-4 mt-10">
                                                    <button
                                                        type="button"
                                                        onClick={handleAddEmergency}
                                                        className="px-10 py-3 bg-[#0EA5E9] text-white font-bold rounded-xl hover:bg-sky-600 shadow-lg shadow-sky-100 transition-all uppercase tracking-widest text-xs"
                                                    >
                                                        保存 Save
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowEmergencyForm(false)}
                                                        className="px-10 py-3 bg-white border-2 border-sky-400 text-sky-500 font-bold rounded-xl hover:bg-sky-50 transition-all uppercase tracking-widest text-xs"
                                                    >
                                                        关闭 Close
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* SECTION 6: GUARANTOR'S INFORMATION */}
                                <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 overflow-hidden border border-slate-100 animate-slideUp" style={{ animationDelay: '500ms' }}>
                                    <div className="bg-[#0EA5E9] px-8 py-5 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center backdrop-blur-sm">
                                                <Diamond className="w-4 h-4 text-white fill-white" />
                                            </div>
                                            <h3 className="text-white font-bold text-xl">事务担保人信息 Guarantor's Information <span className="text-rose-200">*</span></h3>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setShowGuarantorForm(true)}
                                            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all font-bold text-sm border border-white/20"
                                        >
                                            <Plus className="w-4 h-4" /> 添加 Add
                                        </button>
                                    </div>

                                    <div className="p-8 lg:p-10 space-y-8">
                                        {/* Guarantors Table */}
                                        <div className="overflow-hidden border border-slate-100 rounded-2xl shadow-sm">
                                            <table className="w-full text-left border-collapse">
                                                <thead>
                                                    <tr className="bg-slate-50/80 border-b border-slate-100">
                                                        <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center border-r border-slate-100">姓名<br />Name</th>
                                                        <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center border-r border-slate-100">关系<br />Relationship</th>
                                                        <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center border-r border-slate-100">国籍<br />Nationality</th>
                                                        <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center border-r border-slate-100">单位名称<br />Work Place</th>
                                                        <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center border-r border-slate-100">行业类型<br />Industry Type</th>
                                                        <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center border-r border-slate-100">职业<br />Occupation</th>
                                                        <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center border-r border-slate-100">联系电话<br />Phone/Mobile</th>
                                                        <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center border-r border-slate-100">联系邮箱<br />Email</th>
                                                        <th className="px-6 py-4 text-[10px] font-bold text-[#0EA5E9] uppercase tracking-wider text-center">操作</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-50">
                                                    {formData.guarantors.length === 0 ? (
                                                        <tr>
                                                            <td colSpan="9" className="px-6 py-12 text-center text-slate-400 font-medium italic">
                                                                No guarantors added yet.
                                                            </td>
                                                        </tr>
                                                    ) : (
                                                        formData.guarantors.map((g) => (
                                                            <tr key={g.id} className="hover:bg-slate-50/50 transition-colors">
                                                                <td className="px-6 py-4 text-sm font-bold text-slate-700 text-center border-r border-slate-100">{g.name}</td>
                                                                <td className="px-6 py-4 text-sm text-slate-600 text-center border-r border-slate-100">{g.relationship}</td>
                                                                <td className="px-6 py-4 text-sm text-slate-600 text-center border-r border-slate-100">{g.nationality}</td>
                                                                <td className="px-6 py-4 text-sm text-slate-600 text-center border-r border-slate-100">{g.workPlace}</td>
                                                                <td className="px-6 py-4 text-sm text-slate-600 text-center border-r border-slate-100">{g.industryType}</td>
                                                                <td className="px-6 py-4 text-sm text-slate-600 text-center border-r border-slate-100">{g.occupation}</td>
                                                                <td className="px-6 py-4 text-sm text-slate-600 text-center border-r border-slate-100">{g.phone}</td>
                                                                <td className="px-6 py-4 text-sm text-slate-600 text-center border-r border-slate-100">{g.email}</td>
                                                                <td className="px-6 py-4 text-center">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => removeGuarantor(g.id)}
                                                                        className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                                                                    >
                                                                        <Trash2 className="w-4 h-4" />
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        ))
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* Expandable Add Form */}
                                        {showGuarantorForm && (
                                            <div className="bg-slate-50/50 border-2 border-dashed border-sky-100 rounded-[2rem] p-8 lg:p-10 animate-fadeIn section-dropdown">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                                    <div className="space-y-2">
                                                        <label className="text-xs font-bold text-sky-600 uppercase tracking-wider">姓名 Name <span className="text-rose-500">*</span></label>
                                                        <input
                                                            type="text"
                                                            name="name"
                                                            value={currentGuarantor.name}
                                                            onChange={handleGuarantorInputChange}
                                                            className="w-full bg-white border border-slate-200 rounded-xl px-5 py-3 focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 font-medium text-slate-700 placeholder:text-slate-300"
                                                            placeholder="Name"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-xs font-bold text-sky-600 uppercase tracking-wider">关系 Relationship with the student <span className="text-rose-500">*</span></label>
                                                        <select
                                                            name="relationship"
                                                            value={currentGuarantor.relationship}
                                                            onChange={handleGuarantorInputChange}
                                                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 focus:ring-sky-500 font-medium text-slate-700"
                                                        >
                                                            <option value="">请选择 Please Choose</option>
                                                            {RELATIONSHIPS.map(r => (
                                                                <option key={r.value} value={r.value}>{r.name}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-xs font-bold text-sky-600 uppercase tracking-wider">国籍 Nationality <span className="text-rose-500">*</span></label>
                                                        <select
                                                            name="nationality"
                                                            value={currentGuarantor.nationality}
                                                            onChange={handleGuarantorInputChange}
                                                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 focus:ring-sky-500 font-medium text-slate-700"
                                                        >
                                                            <option value="">请选择 Please Choose</option>
                                                            {NATIONALITIES.map(n => (
                                                                <option key={n.value} value={n.value}>{n.name}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-xs font-bold text-sky-600 uppercase tracking-wider">单位名称 Work Place <span className="text-rose-500">*</span></label>
                                                        <input
                                                            type="text"
                                                            name="workPlace"
                                                            value={currentGuarantor.workPlace}
                                                            onChange={handleGuarantorInputChange}
                                                            className="w-full bg-white border border-slate-200 rounded-xl px-5 py-3 focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 font-medium text-slate-700 placeholder:text-slate-300"
                                                            placeholder="Name of Institute/Employer"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-xs font-bold text-sky-600 uppercase tracking-wider">行业类型 Industry Type <span className="text-rose-500">*</span></label>
                                                        <select
                                                            name="industryType"
                                                            value={currentGuarantor.industryType}
                                                            onChange={handleGuarantorInputChange}
                                                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 focus:ring-sky-500 font-medium text-slate-700"
                                                        >
                                                            <option value="">请选择 Please Choose</option>
                                                            {INDUSTRY_TYPES.map(i => (
                                                                <option key={i.value} value={i.value}>{i.name}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-xs font-bold text-sky-600 uppercase tracking-wider">职业 Occupation <span className="text-rose-500">*</span></label>
                                                        <select
                                                            name="occupation"
                                                            value={currentGuarantor.occupation}
                                                            onChange={handleGuarantorInputChange}
                                                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 focus:ring-sky-500 font-medium text-slate-700"
                                                        >
                                                            <option value="">请选择 Please Choose</option>
                                                            {OCCUPATIONS.map(o => (
                                                                <option key={o.value} value={o.value}>{o.name}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-xs font-bold text-sky-600 uppercase tracking-wider">电话 Phone or Mobile <span className="text-rose-500">*</span></label>
                                                        <input
                                                            type="tel"
                                                            name="phone"
                                                            value={currentGuarantor.phone}
                                                            onChange={handleGuarantorInputChange}
                                                            className="w-full bg-white border border-slate-200 rounded-xl px-5 py-3 focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 font-medium text-slate-700 placeholder:text-slate-300"
                                                            placeholder="Contact Tel"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-xs font-bold text-sky-600 uppercase tracking-wider">邮箱 Email <span className="text-rose-500">*</span></label>
                                                        <input
                                                            type="email"
                                                            name="email"
                                                            value={currentGuarantor.email}
                                                            onChange={handleGuarantorInputChange}
                                                            className="w-full bg-white border border-slate-200 rounded-xl px-5 py-3 focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 font-medium text-slate-700 placeholder:text-slate-300"
                                                            placeholder="Contact Email"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-center gap-4 mt-10">
                                                    <button
                                                        type="button"
                                                        onClick={handleAddGuarantor}
                                                        className="px-10 py-3 bg-[#0EA5E9] text-white font-bold rounded-xl hover:bg-sky-600 shadow-lg shadow-sky-100 transition-all uppercase tracking-widest text-xs"
                                                    >
                                                        保存 Save
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowGuarantorForm(false)}
                                                        className="px-10 py-3 bg-white border-2 border-sky-400 text-sky-500 font-bold rounded-xl hover:bg-sky-50 transition-all uppercase tracking-widest text-xs"
                                                    >
                                                        关闭 Close
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Form Controls */}
                                <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-10 border-t border-slate-200">
                                    <div className="flex items-center justify-end gap-4 w-full pt-10 border-t border-slate-100">
                                        {/* Back Button */}
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (activeMainTab > 1) {
                                                    setActiveMainTab(prev => prev - 1)
                                                    window.scrollTo({ top: 0, behavior: 'smooth' })
                                                } else {
                                                    navigate('/dashboard')
                                                }
                                            }}
                                            className="px-6 py-2.5 border border-sky-500 text-sky-500 font-medium rounded-md hover:bg-sky-50 transition-colors"
                                        >
                                            返回 Back
                                        </button>

                                        {/* Save and Continue */}
                                        <button
                                            type="button"
                                            onClick={async () => {
                                                await handleSaveDraft()
                                                if (activeMainTab < 5) {
                                                    setActiveMainTab(prev => prev + 1)
                                                    window.scrollTo({ top: 0, behavior: 'smooth' })
                                                }
                                            }}
                                            disabled={saving}
                                            className="px-6 py-2.5 bg-[#1e40af] text-white font-medium rounded-md hover:bg-blue-800 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {saving ? 'Saving...' : '保存并继续 Save and Continue'}
                                        </button>

                                        {/* Next Button */}
                                        {activeMainTab < 5 ? (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setActiveMainTab(prev => prev + 1)
                                                    window.scrollTo({ top: 0, behavior: 'smooth' })
                                                }}
                                                className="px-6 py-2.5 border border-sky-500 text-sky-500 font-medium rounded-md hover:bg-sky-50 transition-colors"
                                            >
                                                下一步 Next
                                            </button>
                                        ) : (
                                            <button
                                                type="submit"
                                                disabled={saving}
                                                className="px-6 py-2.5 bg-sky-500 text-white font-medium rounded-md hover:bg-sky-600 transition-colors shadow-sm disabled:opacity-50"
                                            >
                                                提交 Submit
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ================= TAB 2 CONTENT ================= */}

                        {activeMainTab === 2 && (
                            <div className="space-y-10">
                                {/* SECTION 1: Major's Information */}
                                <div id="major" className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 overflow-hidden border border-slate-100 animate-slideUp">
                                    <div className="bg-[#0EA5E9] px-8 py-5 flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center backdrop-blur-sm">
                                            <Diamond className="w-4 h-4 text-white fill-white" />
                                        </div>
                                        <h3 className="text-white font-bold text-xl uppercase tracking-tight">学习专业 Major's Information</h3>
                                    </div>
                                    <div className="p-8 lg:p-10 space-y-8">
                                        {/* Read Only Info Grid */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                                            {/* Course */}
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-sky-600 uppercase tracking-wider">专业 Course</label>
                                                <div className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 font-bold text-[#4F46E5] text-sm shadow-sm">
                                                    {formData.majorCourse}
                                                </div>
                                            </div>
                                            {/* Teaching Language */}
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-sky-600 uppercase tracking-wider">授课语言 Teaching Language</label>
                                                <div className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 font-bold text-[#4F46E5] text-sm shadow-sm">
                                                    {formData.majorTeachingLanguage}
                                                </div>
                                            </div>

                                            {/* Degree */}
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-sky-600 uppercase tracking-wider">学历 Degree</label>
                                                <div className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 font-bold text-[#4F46E5] text-sm shadow-sm">
                                                    {formData.majorDegree}
                                                </div>
                                            </div>
                                            {/* College */}
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-sky-600 uppercase tracking-wider">学院 College</label>
                                                <div className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 font-bold text-[#4F46E5] text-sm shadow-sm">
                                                    {formData.majorCollege}
                                                </div>
                                            </div>

                                            {/* Entry Year */}
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-sky-600 uppercase tracking-wider">入学年份 Entry Year <span className="text-rose-500">*</span></label>
                                                <div className="flex gap-4">
                                                    <div className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 font-bold text-[#4F46E5] text-sm shadow-sm">
                                                        {formData.majorEntryYear}
                                                    </div>
                                                    <div className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 font-bold text-[#4F46E5] text-sm shadow-sm">
                                                        {formData.majorEntrySeason}
                                                    </div>
                                                </div>
                                            </div>
                                            {/* Study Duration */}
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-sky-600 uppercase tracking-wider">学习期限 Study Duration <span className="text-rose-500">*</span></label>
                                                <div className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 font-bold text-[#4F46E5] text-sm shadow-sm">
                                                    {formData.majorStudyDuration}
                                                </div>
                                            </div>

                                            {/* Enrollment Category */}
                                            <div className="md:col-span-2 space-y-2">
                                                <label className="text-xs font-bold text-sky-600 uppercase tracking-wider">招生项目 Enrollment Category</label>
                                                <div className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 font-bold text-[#4F46E5] text-sm shadow-sm">
                                                    {formData.majorEnrollmentCategory}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Change Course Button */}
                                        <button type="button" className="w-full py-3 bg-white border border-slate-200 text-sky-500 font-bold rounded-xl hover:bg-sky-50 hover:border-sky-200 transition-all uppercase tracking-widest text-sm shadow-sm flex items-center justify-center gap-2">
                                            <Edit3 className="w-4 h-4" />
                                            修改学习专业 Change Course
                                        </button>

                                        <div className="pt-8 border-t border-slate-100 grid grid-cols-1 gap-8">
                                            {/* Reference Type */}
                                            <div className="space-y-2 max-w-md">
                                                <label className="text-xs font-bold text-sky-600 uppercase tracking-wider">推荐类型 Reference Type <span className="text-rose-500">*</span></label>
                                                <select
                                                    name="referenceType"
                                                    value={formData.referenceType}
                                                    onChange={handleInputChange}
                                                    className="w-full bg-white border border-rose-200 rounded-lg px-4 py-2.5 focus:ring-sky-500 font-bold text-[#4F46E5] text-sm appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2232%22%20height%3D%2232%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:1.25em_1.25em] bg-[right_0.75rem_center] bg-no-repeat"
                                                >
                                                    <option value="">请选择 Please Choose</option>
                                                    <option value="Agent">Agent</option>
                                                    <option value="Self">Self</option>
                                                    <option value="Other">Other</option>
                                                </select>
                                            </div>

                                            {/* Scholarship */}
                                            <div className="space-y-4">
                                                <label className="text-xs font-bold text-sky-600 uppercase tracking-wider block">
                                                    是否申请奖学金 Whether to apply for a scholarship?
                                                </label>
                                                <div className="flex gap-6">
                                                    {['Yes', 'No'].map(opt => (
                                                        <label key={opt} className="flex items-center gap-3 cursor-pointer group">
                                                            <div className="relative flex items-center justify-center">
                                                                <input
                                                                    type="radio"
                                                                    name="applyForScholarship"
                                                                    value={opt}
                                                                    checked={formData.applyForScholarship === opt}
                                                                    onChange={handleInputChange}
                                                                    className="peer appearance-none w-5 h-5 border-2 border-slate-200 rounded-full checked:border-sky-500 transition-all"
                                                                />
                                                                <div className="absolute w-2.5 h-2.5 bg-sky-500 rounded-full scale-0 peer-checked:scale-100 transition-all"></div>
                                                            </div>
                                                            <span className={`text-[11px] font-bold ${formData.applyForScholarship === opt ? 'text-sky-600' : 'text-slate-500'}`}>{opt}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* SECTION 2: Referee Information */}
                                <div id="referee" className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 overflow-hidden border border-slate-100 animate-slideUp" style={{ animationDelay: '100ms' }}>
                                    <div className="bg-[#0EA5E9] px-8 py-5 flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center backdrop-blur-sm">
                                            <Diamond className="w-4 h-4 text-white fill-white" />
                                        </div>
                                        <h3 className="text-white font-bold text-xl uppercase tracking-tight">推荐人信息 Referee Information</h3>
                                    </div>
                                    <div className="p-8 lg:p-10">
                                        {/* Summary Table */}
                                        <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm mb-6">
                                            <table className="w-full text-sm text-left">
                                                <thead className="bg-slate-50 text-slate-700 font-bold uppercase text-xs tracking-wider border-b border-slate-200">
                                                    <tr>
                                                        <th className="px-6 py-4">姓名 Name</th>
                                                        <th className="px-6 py-4">关系 Relationship</th>
                                                        <th className="px-6 py-4">单位名称 Work Place</th>
                                                        <th className="px-6 py-4">职业 Occupation</th>
                                                        <th className="px-6 py-4">联系电话 Phone/Mobile</th>
                                                        <th className="px-6 py-4">联系邮箱 Email</th>
                                                        <th className="px-6 py-4 text-right">
                                                            <button
                                                                onClick={() => setShowRefereeForm(true)}
                                                                className={`text-sky-500 hover:text-sky-600 font-bold flex items-center justify-end gap-1 ml-auto ${showRefereeForm ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                                disabled={showRefereeForm}
                                                            >
                                                                Add 添加
                                                            </button>
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100">
                                                    {formData.referees.length === 0 ? (
                                                        <tr>
                                                            <td colSpan="7" className="px-6 py-8 text-center text-slate-400 italic">
                                                                No referees added yet. Please click "Add" to enter details.
                                                            </td>
                                                        </tr>
                                                    ) : (
                                                        formData.referees.map((ref, index) => (
                                                            <tr key={ref.id || index} className="hover:bg-slate-50 transition-colors">
                                                                <td className="px-6 py-4 font-bold text-slate-700">{ref.name}</td>
                                                                <td className="px-6 py-4 text-slate-600">{ref.relationship}</td>
                                                                <td className="px-6 py-4 text-slate-600">{ref.workPlace}</td>
                                                                <td className="px-6 py-4 text-slate-600">{ref.occupation}</td>
                                                                <td className="px-6 py-4 text-slate-600 font-mono text-xs">{ref.phone}</td>
                                                                <td className="px-6 py-4 text-slate-600 font-mono text-xs">{ref.email}</td>
                                                                <td className="px-6 py-4 text-right">
                                                                    <button
                                                                        onClick={() => removeReferee(ref.id)}
                                                                        className="text-rose-400 hover:text-rose-600 p-2 hover:bg-rose-50 rounded-full transition-all"
                                                                    >
                                                                        <Trash2 className="w-4 h-4" />
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        ))
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* Add Form */}
                                        {showRefereeForm && (
                                            <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-lg animate-fadeIn ring-4 ring-slate-50 mt-6">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                                    {/* Name */}
                                                    <div className="space-y-2">
                                                        <label className="text-xs font-bold text-sky-600 uppercase tracking-wider">姓名 Name <span className="text-rose-500">*</span></label>
                                                        <input
                                                            type="text"
                                                            name="name"
                                                            value={currentReferee.name}
                                                            onChange={handleRefereeInputChange}
                                                            className="w-full bg-white border border-rose-300 rounded-lg px-4 py-2.5 focus:ring-sky-500 text-sm font-medium"
                                                            placeholder="Name"
                                                        />
                                                    </div>

                                                    {/* Relationship */}
                                                    <div className="space-y-2">
                                                        <label className="text-xs font-bold text-sky-600 uppercase tracking-wider">关系 Relationship with the student <span className="text-rose-500">*</span></label>
                                                        <select
                                                            name="relationship"
                                                            value={currentReferee.relationship}
                                                            onChange={handleRefereeInputChange}
                                                            className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 focus:ring-sky-500 text-sm font-medium text-[#4F46E5] font-bold"
                                                        >
                                                            <option value="">Please Choose</option>
                                                            <option value="Employer">Employer 雇佣</option>
                                                            <option value="Teacher">Teacher 老师</option>
                                                            <option value="Friend">Friend 朋友</option>
                                                            <option value="Colleague">Colleague 同事</option>
                                                            <option value="Other">Other 其他</option>
                                                        </select>
                                                    </div>

                                                    {/* Work Place */}
                                                    <div className="space-y-2">
                                                        <label className="text-xs font-bold text-sky-600 uppercase tracking-wider">单位名称 Work Place <span className="text-rose-500">*</span></label>
                                                        <input
                                                            type="text"
                                                            name="workPlace"
                                                            value={currentReferee.workPlace}
                                                            onChange={handleRefereeInputChange}
                                                            className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 focus:ring-sky-500 text-sm font-medium"
                                                            placeholder="Name of Institute/Employer"
                                                        />
                                                    </div>

                                                    {/* Industry Type */}
                                                    <div className="space-y-2">
                                                        <label className="text-xs font-bold text-sky-600 uppercase tracking-wider">行业类型 Industry Type <span className="text-rose-500">*</span></label>
                                                        <select
                                                            name="industryType"
                                                            value={currentReferee.industryType}
                                                            onChange={handleRefereeInputChange}
                                                            className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 focus:ring-sky-500 text-sm font-medium text-[#4F46E5] font-bold"
                                                        >
                                                            <option value="">请选择 Please Choose</option>
                                                            {INDUSTRY_TYPES.map(type => (
                                                                <option key={type.value} value={type.value}>{type.name}</option>
                                                            ))}
                                                        </select>
                                                    </div>

                                                    {/* Occupation */}
                                                    <div className="space-y-2">
                                                        <label className="text-xs font-bold text-sky-600 uppercase tracking-wider">职业 Occupation <span className="text-rose-500">*</span></label>
                                                        <select
                                                            name="occupation"
                                                            value={currentReferee.occupation}
                                                            onChange={handleRefereeInputChange}
                                                            className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 focus:ring-sky-500 text-sm font-medium text-[#4F46E5] font-bold"
                                                        >
                                                            <option value="">请选择 Please Choose</option>
                                                            {OCCUPATIONS.map(occ => (
                                                                <option key={occ.value} value={occ.value}>{occ.name}</option>
                                                            ))}
                                                        </select>
                                                    </div>

                                                    {/* Phone */}
                                                    <div className="space-y-2">
                                                        <label className="text-xs font-bold text-sky-600 uppercase tracking-wider">电话 Phone or Mobile <span className="text-rose-500">*</span></label>
                                                        <input
                                                            type="tel"
                                                            name="phone"
                                                            value={currentReferee.phone}
                                                            onChange={handleRefereeInputChange}
                                                            className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 focus:ring-sky-500 text-sm font-medium"
                                                            placeholder="Contact Tel"
                                                        />
                                                    </div>

                                                    {/* Email */}
                                                    <div className="col-span-1 md:col-span-2 space-y-2">
                                                        <label className="text-xs font-bold text-sky-600 uppercase tracking-wider">邮箱 Email: <span className="text-rose-500">*</span></label>
                                                        <input
                                                            type="email"
                                                            name="email"
                                                            value={currentReferee.email}
                                                            onChange={handleRefereeInputChange}
                                                            className="w-full bg-white border border-rose-300 rounded-lg px-4 py-2.5 focus:ring-sky-500 text-sm font-medium"
                                                            placeholder="Contact Email"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-center gap-4 mt-8 pt-8 border-t border-slate-100">
                                                    <button
                                                        onClick={handleAddReferee}
                                                        className="px-8 py-2.5 bg-[#5A9CF8] hover:bg-sky-600 text-white font-bold rounded-lg shadow-lg shadow-sky-200/50 transition-all flex items-center gap-2"
                                                    >
                                                        保存 Save
                                                    </button>
                                                    <button
                                                        onClick={() => setShowRefereeForm(false)}
                                                        className="px-8 py-2.5 bg-white border border-sky-300 text-sky-500 font-bold rounded-lg hover:bg-sky-50 transition-all flex items-center gap-2"
                                                    >
                                                        关闭 Close
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* SECTION 3: Language Proficiency */}
                                <div id="language" className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 overflow-hidden border border-slate-100 animate-slideUp" style={{ animationDelay: '200ms' }}>
                                    <div className="bg-[#0EA5E9] px-8 py-5 flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center backdrop-blur-sm">
                                            <Diamond className="w-4 h-4 text-white fill-white" />
                                        </div>
                                        <h3 className="text-white font-bold text-xl uppercase tracking-tight">语言能力 Language Proficiency</h3>
                                    </div>
                                    <div className="p-8 lg:p-10">
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-8">
                                            {/* LEFT COLUMN: English */}
                                            <div className="space-y-6">
                                                {/* English Proficiency */}
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold text-sky-600 uppercase tracking-wider">英语水平 English Proficiency <span className="text-rose-500">*</span></label>
                                                    <select
                                                        name="englishProficiency"
                                                        value={formData.englishProficiency}
                                                        onChange={handleInputChange}
                                                        className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 focus:ring-sky-500 text-sm font-bold text-[#4F46E5]"
                                                    >
                                                        <option value="">请选择 Please Choose</option>
                                                        <option value="Excellent">很好 Excellent</option>
                                                        <option value="Good">好 Good</option>
                                                        <option value="Fair">一般 Fair</option>
                                                        <option value="Poor">差 Poor</option>
                                                        <option value="None">无 None</option>
                                                    </select>
                                                </div>

                                                {/* IELTS */}
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold text-sky-600 uppercase tracking-wider">雅思 IELTS</label>
                                                    <input
                                                        type="text"
                                                        name="ieltsScore"
                                                        value={formData.ieltsScore}
                                                        onChange={handleInputChange}
                                                        className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 focus:ring-sky-500 text-sm font-medium"
                                                        placeholder="IELTS"
                                                    />
                                                </div>

                                                {/* TOEFL */}
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold text-sky-600 uppercase tracking-wider">托福 TOEFL</label>
                                                    <input
                                                        type="text"
                                                        name="toeflScore"
                                                        value={formData.toeflScore}
                                                        onChange={handleInputChange}
                                                        className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 focus:ring-sky-500 text-sm font-medium"
                                                        placeholder="TOEFL"
                                                    />
                                                </div>

                                                {/* GRE */}
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold text-sky-600 uppercase tracking-wider">GRE成绩 GRE</label>
                                                    <input
                                                        type="text"
                                                        name="greScore"
                                                        value={formData.greScore}
                                                        onChange={handleInputChange}
                                                        className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 focus:ring-sky-500 text-sm font-medium"
                                                        placeholder="GRE"
                                                    />
                                                </div>

                                                {/* GMAT */}
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold text-sky-600 uppercase tracking-wider">GMAT成绩 GMAT</label>
                                                    <input
                                                        type="text"
                                                        name="gmatScore"
                                                        value={formData.gmatScore}
                                                        onChange={handleInputChange}
                                                        className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 focus:ring-sky-500 text-sm font-medium"
                                                        placeholder="GMAT"
                                                    />
                                                </div>

                                                {/* Duolingo */}
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold text-sky-600 uppercase tracking-wider">多邻国成绩 Duolingo</label>
                                                    <input
                                                        type="text"
                                                        name="duolingoScore"
                                                        value={formData.duolingoScore}
                                                        onChange={handleInputChange}
                                                        className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 focus:ring-sky-500 text-sm font-medium"
                                                        placeholder="Duolingo"
                                                    />
                                                </div>

                                                {/* TOEIC */}
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold text-sky-600 uppercase tracking-wider">托业成绩 TOEIC</label>
                                                    <input
                                                        type="text"
                                                        name="toeicScore"
                                                        value={formData.toeicScore}
                                                        onChange={handleInputChange}
                                                        className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 focus:ring-sky-500 text-sm font-medium"
                                                        placeholder="TOEIC"
                                                    />
                                                </div>

                                                {/* Other English Cert */}
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold text-sky-600 uppercase tracking-wider">其他英语能力证明 Other English proficiency certificate</label>
                                                    <input
                                                        type="text"
                                                        name="otherEnglishCertificate"
                                                        value={formData.otherEnglishCertificate}
                                                        onChange={handleInputChange}
                                                        className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 focus:ring-sky-500 text-sm font-medium"
                                                        placeholder="Other English proficiency certificate"
                                                    />
                                                </div>
                                            </div>

                                            {/* RIGHT COLUMN: Chinese */}
                                            <div className="space-y-6">
                                                {/* Chinese Proficiency */}
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold text-sky-600 uppercase tracking-wider">汉语水平 Chinese Proficiency <span className="text-rose-500">*</span></label>
                                                    <select
                                                        name="chineseProficiency"
                                                        value={formData.chineseProficiency}
                                                        onChange={handleInputChange}
                                                        className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 focus:ring-sky-500 text-sm font-bold text-[#4F46E5]"
                                                    >
                                                        <option value="">请选择 Please Choose</option>
                                                        <option value="Excellent">很好 Excellent</option>
                                                        <option value="Good">好 Good</option>
                                                        <option value="Fair">一般 Fair</option>
                                                        <option value="Poor">差 Poor</option>
                                                        <option value="None">无 None</option>
                                                    </select>
                                                </div>

                                                {/* HSK Level & Score */}
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold text-sky-600 uppercase tracking-wider">HSK等级 HSK Level & HSK成绩 HSK Scores <span className="text-rose-500">*</span></label>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <select
                                                            name="hskLevel"
                                                            value={formData.hskLevel}
                                                            onChange={handleInputChange}
                                                            className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 focus:ring-sky-500 text-sm font-bold text-[#4F46E5]"
                                                        >
                                                            <option value="None">None</option>
                                                            <option value="HSK1">HSK Level 1</option>
                                                            <option value="HSK2">HSK Level 2</option>
                                                            <option value="HSK3">HSK Level 3</option>
                                                            <option value="HSK4">HSK Level 4</option>
                                                            <option value="HSK5">HSK Level 5</option>
                                                            <option value="HSK6">HSK Level 6</option>
                                                        </select>
                                                        <input
                                                            type="text"
                                                            name="hskScore"
                                                            value={formData.hskScore}
                                                            onChange={handleInputChange}
                                                            className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 focus:ring-sky-500 text-sm font-medium"
                                                            placeholder="HSK Scores"
                                                        />
                                                    </div>
                                                </div>

                                                {/* HSK Detailed Scores */}
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold text-sky-600 uppercase tracking-wider">听力成绩 Listening & 阅读成绩 Reading & 书写成绩 Writing</label>
                                                    <div className="grid grid-cols-3 gap-2">
                                                        <input
                                                            type="text"
                                                            name="hskListeningScore"
                                                            value={formData.hskListeningScore}
                                                            onChange={handleInputChange}
                                                            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2.5 focus:ring-sky-500 text-xs font-medium"
                                                            placeholder="听力成绩 Listening"
                                                        />
                                                        <input
                                                            type="text"
                                                            name="hskReadingScore"
                                                            value={formData.hskReadingScore}
                                                            onChange={handleInputChange}
                                                            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2.5 focus:ring-sky-500 text-xs font-medium"
                                                            placeholder="阅读成绩 Reading"
                                                        />
                                                        <input
                                                            type="text"
                                                            name="hskWritingScore"
                                                            value={formData.hskWritingScore}
                                                            onChange={handleInputChange}
                                                            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2.5 focus:ring-sky-500 text-xs font-medium"
                                                            placeholder="书写成绩 Writing"
                                                        />
                                                    </div>
                                                </div>

                                                {/* HSK No */}
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold text-sky-600 uppercase tracking-wider">HSK证书编号 HSK No</label>
                                                    <input
                                                        type="text"
                                                        name="hskNo"
                                                        value={formData.hskNo}
                                                        onChange={handleInputChange}
                                                        className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 focus:ring-sky-500 text-sm font-medium"
                                                        placeholder="HSK No"
                                                    />
                                                </div>

                                                {/* HSK Test Date */}
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold text-sky-600 uppercase tracking-wider">HSK 考试时间 HSK Test Date</label>
                                                    <input
                                                        type="date"
                                                        name="hskTestDate"
                                                        value={formData.hskTestDate}
                                                        onChange={handleInputChange}
                                                        className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 focus:ring-sky-500 text-sm font-medium text-slate-600"
                                                    />
                                                </div>

                                                {/* HSKK Level & Score */}
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold text-sky-600 uppercase tracking-wider">HSKK等级 HSKK Level & HSKK成绩 HSKK Scores</label>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <select
                                                            name="hskkLevel"
                                                            value={formData.hskkLevel}
                                                            onChange={handleInputChange}
                                                            className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 focus:ring-sky-500 text-sm font-bold text-[#4F46E5]"
                                                        >
                                                            <option value="None">None</option>
                                                            <option value="Beginner">初级 Beginner</option>
                                                            <option value="Intermediate">中级 Intermediate</option>
                                                            <option value="Advanced">高级 Advanced</option>
                                                        </select>
                                                        <input
                                                            type="text"
                                                            name="hskkScore"
                                                            value={formData.hskkScore}
                                                            onChange={handleInputChange}
                                                            className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 focus:ring-sky-500 text-sm font-medium"
                                                            placeholder="HSKK Scores"
                                                        />
                                                    </div>
                                                </div>

                                                {/* Time of Chinese Learning */}
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold text-sky-600 uppercase tracking-wider">学习汉语时间 Time of Chinese langauge learning</label>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <input
                                                            type="date"
                                                            name="chineseLearningStartDate"
                                                            value={formData.chineseLearningStartDate}
                                                            onChange={handleInputChange}
                                                            className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 focus:ring-sky-500 text-sm font-medium text-slate-600"
                                                        />
                                                        <input
                                                            type="date"
                                                            name="chineseLearningEndDate"
                                                            value={formData.chineseLearningEndDate}
                                                            onChange={handleInputChange}
                                                            className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 focus:ring-sky-500 text-sm font-medium text-slate-600"
                                                        />
                                                    </div>
                                                </div>

                                                {/* Teacher Nationality */}
                                                <div className="space-y-3">
                                                    <label className="text-xs font-bold text-sky-600 uppercase tracking-wider">汉语教师是否为中国国籍 Whether the Chinese teacher own a Chinese nationality</label>
                                                    <div className="flex gap-6">
                                                        {['Yes', 'No'].map(opt => (
                                                            <label key={opt} className="flex items-center gap-3 cursor-pointer group">
                                                                <div className="relative flex items-center justify-center">
                                                                    <input
                                                                        type="radio"
                                                                        name="chineseTeacherNationality"
                                                                        value={opt}
                                                                        checked={formData.chineseTeacherNationality === opt}
                                                                        onChange={handleInputChange}
                                                                        className="peer appearance-none w-5 h-5 border-2 border-slate-200 rounded-full checked:border-sky-500 transition-all"
                                                                    />
                                                                    <div className="absolute w-2.5 h-2.5 bg-sky-500 rounded-full scale-0 peer-checked:scale-100 transition-all"></div>
                                                                </div>
                                                                <span className={`text-sm font-bold ${formData.chineseTeacherNationality === opt ? 'text-sky-600' : 'text-slate-500'}`}>{opt}</span>
                                                            </label>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Institution Name */}
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold text-sky-600 uppercase tracking-wider">汉语学习机构名称 Name of institution for Chinese learning</label>
                                                    <input
                                                        type="text"
                                                        name="chineseLearningInstitution"
                                                        value={formData.chineseLearningInstitution}
                                                        onChange={handleInputChange}
                                                        className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 focus:ring-sky-500 text-sm font-medium"
                                                        placeholder="Chinese organization name"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* SECTION 4: Education Background */}
                                <div id="education" className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 overflow-hidden border border-slate-100 animate-slideUp" style={{ animationDelay: '300ms' }}>
                                    <div className="bg-[#0EA5E9] px-8 py-5 flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center backdrop-blur-sm">
                                            <Diamond className="w-4 h-4 text-white fill-white" />
                                        </div>
                                        <h3 className="text-white font-bold text-xl uppercase tracking-tight">教育背景 Education Background <span className="text-rose-200">*</span></h3>
                                    </div>
                                    <div className="p-8 lg:p-10">
                                        {/* Highest Degree Section */}
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-6 mb-10 border-b border-slate-100 pb-10">
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-sky-600 uppercase tracking-wider">最高学历 Highest Degree<span className="text-rose-500">*</span></label>
                                                <select
                                                    name="educationHighestDegree"
                                                    value={formData.educationHighestDegree}
                                                    onChange={handleInputChange}
                                                    className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 focus:ring-sky-500 text-sm font-bold text-[#4F46E5]"
                                                >
                                                    <option value="">请选择 Please Choose</option>
                                                    <option value="High School">高中 High School</option>
                                                    <option value="Bachelor">本科 Bachelor</option>
                                                    <option value="Master">硕士 Master</option>
                                                    <option value="PhD">博士 PhD</option>
                                                    <option value="Other">其他 Other</option>
                                                </select>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-sky-600 uppercase tracking-wider">最高学历毕业院校 Name of Highest graduated school<span className="text-rose-500">*</span></label>
                                                <input
                                                    type="text"
                                                    name="educationHighestSchool"
                                                    value={formData.educationHighestSchool}
                                                    onChange={handleInputChange}
                                                    className={`w-full bg-white border ${!formData.educationHighestSchool ? 'border-rose-300' : 'border-slate-200'} rounded-lg px-4 py-2.5 focus:ring-sky-500 text-sm font-medium`}
                                                    placeholder="School Name"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-sky-600 uppercase tracking-wider">最高学历证书类型 Certificate type of highest degree level</label>
                                                <select
                                                    name="educationCertificateType"
                                                    value={formData.educationCertificateType}
                                                    onChange={handleInputChange}
                                                    className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 focus:ring-sky-500 text-sm font-bold text-[#4F46E5]"
                                                >
                                                    <option value="">请选择 Please Choose</option>
                                                    <option value="Diploma">毕业证书 Diploma/Degree certificate</option>
                                                    <option value="Graduation">结业证书 Graduation certificate</option>
                                                </select>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-sky-600 uppercase tracking-wider">如果满分是100分，最高学历成绩 Mark range of your highest degree if the full mark is</label>
                                                <select
                                                    name="educationMarkRange"
                                                    value={formData.educationMarkRange}
                                                    onChange={handleInputChange}
                                                    className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 focus:ring-sky-500 text-sm font-bold text-[#4F46E5]"
                                                >
                                                    <option value="">请选择 Please Choose</option>
                                                    <option value="100">100</option>
                                                    <option value="5.0">5.0</option>
                                                    <option value="4.0">4.0</option>
                                                    <option value="Other">Other</option>
                                                </select>
                                            </div>

                                            <div className="space-y-3">
                                                <label className="text-xs font-bold text-sky-600 uppercase tracking-wider">最高学历成绩是否挂科 Any failure in your highest degree marks</label>
                                                <div className="flex gap-6">
                                                    {['Yes', 'No'].map(opt => (
                                                        <label key={opt} className="flex items-center gap-3 cursor-pointer group">
                                                            <div className="relative flex items-center justify-center">
                                                                <input
                                                                    type="radio"
                                                                    name="educationFailure"
                                                                    value={opt}
                                                                    checked={formData.educationFailure === opt}
                                                                    onChange={handleInputChange}
                                                                    className="peer appearance-none w-5 h-5 border-2 border-slate-200 rounded-full checked:border-sky-500 transition-all"
                                                                />
                                                                <div className="absolute w-2.5 h-2.5 bg-sky-500 rounded-full scale-0 peer-checked:scale-100 transition-all"></div>
                                                            </div>
                                                            <span className={`text-sm font-bold ${formData.educationFailure === opt ? 'text-sky-600' : 'text-slate-500'}`}>{opt}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Warning Text */}
                                        <div className="bg-slate-50 border border-slate-100 rounded-lg p-4 mb-6">
                                            <p className="text-xs text-slate-600 leading-relaxed">
                                                <span className="text-rose-500 font-bold">*</span> 请按时间顺序填写（比如大学、高中、初中的顺序），两段经历的间隔最好不要超过6个月。<br />
                                                Please fill in chronological order (such as the order of University, high school and junior high school), Any gap between two experiences is better NOT more than 6 months.
                                            </p>
                                        </div>

                                        {/* Summary Table */}
                                        <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm mb-6">
                                            <table className="w-full text-sm text-left">
                                                <thead className="bg-[#F8FAFC] text-slate-700 font-bold uppercase text-xs tracking-wider border-b border-slate-200">
                                                    <tr>
                                                        <th className="px-6 py-4">学历 Degree</th>
                                                        <th className="px-6 py-4">学校 School name</th>
                                                        <th className="px-6 py-4">开始时间 Year of attendance (from)</th>
                                                        <th className="px-6 py-4">结束时间 Year of attendance (to)</th>
                                                        <th className="px-6 py-4">联系人 Contact person</th>
                                                        <th className="px-6 py-4 text-right">
                                                            <button
                                                                onClick={() => setShowEducationForm(true)}
                                                                className={`text-sky-500 hover:text-sky-600 font-bold flex items-center justify-end gap-1 ml-auto ${showEducationForm ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                                disabled={showEducationForm}
                                                            >
                                                                Add 添加
                                                            </button>
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100">
                                                    {formData.educations.length === 0 ? (
                                                        <tr>
                                                            <td colSpan="6" className="px-6 py-8 text-center text-slate-400 italic">
                                                                No education history added. Please click "Add" to enter details.
                                                            </td>
                                                        </tr>
                                                    ) : (
                                                        formData.educations.map((edu, index) => (
                                                            <tr key={edu.id || index} className="hover:bg-slate-50 transition-colors">
                                                                <td className="px-6 py-4 font-bold text-slate-700">{edu.degree}</td>
                                                                <td className="px-6 py-4 text-slate-600">{edu.schoolName}</td>
                                                                <td className="px-6 py-4 text-slate-600">{edu.startDate}</td>
                                                                <td className="px-6 py-4 text-slate-600">{edu.endDate}</td>
                                                                <td className="px-6 py-4 text-slate-600">{edu.contactPerson}</td>
                                                                <td className="px-6 py-4 text-right">
                                                                    <button
                                                                        onClick={() => removeEducation(edu.id)}
                                                                        className="text-rose-400 hover:text-rose-600 transition-colors"
                                                                    >
                                                                        <Trash2 className="w-4 h-4" />
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        ))
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* Add Education Form */}
                                        {showEducationForm && (
                                            <div className="bg-slate-50 rounded-xl p-6 lg:p-8 border border-sky-100 animate-fadeIn">
                                                <h4 className="font-bold text-slate-700 mb-6 flex items-center gap-2">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-sky-500"></span>
                                                    Add Education Experience
                                                </h4>

                                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                                    {/* Degree */}
                                                    <div className="space-y-2">
                                                        <label className="text-xs font-bold text-sky-600 uppercase tracking-wider">学历 Degree<span className="text-rose-500">*</span></label>
                                                        <select
                                                            name="degree"
                                                            value={currentEducation.degree}
                                                            onChange={handleEducationInputChange}
                                                            className="w-full bg-white border border-rose-300 rounded-lg px-4 py-2.5 focus:ring-sky-500 text-sm font-bold text-[#4F46E5]"
                                                        >
                                                            <option value="">请选择 Please Choose</option>
                                                            <option value="High School">高中 High School</option>
                                                            <option value="Bachelor">本科 Bachelor</option>
                                                            <option value="Master">硕士 Master</option>
                                                            <option value="PhD">博士 PhD</option>
                                                        </select>
                                                    </div>

                                                    {/* School Type */}
                                                    <div className="space-y-2">
                                                        <label className="text-xs font-bold text-sky-600 uppercase tracking-wider">学校类型 School Type<span className="text-rose-500">*</span></label>
                                                        <select
                                                            name="schoolType"
                                                            value={currentEducation.schoolType}
                                                            onChange={handleEducationInputChange}
                                                            className="w-full bg-white border border-rose-300 rounded-lg px-4 py-2.5 focus:ring-sky-500 text-sm font-bold text-[#4F46E5]"
                                                        >
                                                            <option value="">请选择 Please Choose</option>
                                                            <option value="Public">Public</option>
                                                            <option value="Private">Private</option>
                                                        </select>
                                                    </div>

                                                    {/* Country */}
                                                    <div className="space-y-2">
                                                        <label className="text-xs font-bold text-sky-600 uppercase tracking-wider">国家 Country<span className="text-rose-500">*</span></label>
                                                        <select
                                                            name="country"
                                                            value={currentEducation.country}
                                                            onChange={handleEducationInputChange}
                                                            className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 focus:ring-sky-500 text-sm font-medium"
                                                        >
                                                            <option value="">请选择 Please Choose</option>
                                                            {NATIONALITIES.map(nat => (
                                                                <option key={nat.value} value={nat.value}>{nat.name}</option>
                                                            ))}
                                                        </select>
                                                    </div>

                                                    {/* School Name */}
                                                    <div className="space-y-2">
                                                        <label className="text-xs font-bold text-sky-600 uppercase tracking-wider">学校名称 School Name<span className="text-rose-500">*</span></label>
                                                        <input
                                                            type="text"
                                                            name="schoolName"
                                                            value={currentEducation.schoolName}
                                                            onChange={handleEducationInputChange}
                                                            className="w-full bg-white border border-rose-300 rounded-lg px-4 py-2.5 focus:ring-sky-500 text-sm font-medium"
                                                            placeholder="School Name"
                                                        />
                                                    </div>

                                                    {/* Start Date */}
                                                    <div className="space-y-2">
                                                        <label className="text-xs font-bold text-sky-600 uppercase tracking-wider">开始时间 Year of attendance (from)<span className="text-rose-500">*</span></label>
                                                        <input
                                                            type="date"
                                                            name="startDate"
                                                            value={currentEducation.startDate}
                                                            onChange={handleEducationInputChange}
                                                            className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 focus:ring-sky-500 text-sm font-medium text-slate-600"
                                                        />
                                                    </div>

                                                    {/* End Date */}
                                                    <div className="space-y-2">
                                                        <label className="text-xs font-bold text-sky-600 uppercase tracking-wider">结束时间 Year of attendance (to)<span className="text-rose-500">*</span></label>
                                                        <input
                                                            type="date"
                                                            name="endDate"
                                                            value={currentEducation.endDate}
                                                            onChange={handleEducationInputChange}
                                                            className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 focus:ring-sky-500 text-sm font-medium text-slate-600"
                                                        />
                                                    </div>

                                                    {/* Field of Study */}
                                                    <div className="space-y-2">
                                                        <label className="text-xs font-bold text-sky-600 uppercase tracking-wider">专业领域 Field of study<span className="text-rose-500">*</span></label>
                                                        <input
                                                            type="text"
                                                            name="fieldOfStudy"
                                                            value={currentEducation.fieldOfStudy}
                                                            onChange={handleEducationInputChange}
                                                            className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 focus:ring-sky-500 text-sm font-medium"
                                                            placeholder="Field of study"
                                                        />
                                                    </div>

                                                    {/* Diploma */}
                                                    <div className="space-y-2">
                                                        <label className="text-xs font-bold text-sky-600 uppercase tracking-wider">获得证书 Major and Diploma Received<span className="text-rose-500">*</span></label>
                                                        <input
                                                            type="text"
                                                            name="diploma"
                                                            value={currentEducation.diploma}
                                                            onChange={handleEducationInputChange}
                                                            className="w-full bg-white border border-rose-300 rounded-lg px-4 py-2.5 focus:ring-sky-500 text-sm font-medium"
                                                            placeholder="Major and Diploma Received"
                                                        />
                                                    </div>

                                                    {/* Contact Person */}
                                                    <div className="space-y-2">
                                                        <label className="text-xs font-bold text-sky-600 uppercase tracking-wider">联系人 Contact person</label>
                                                        <input
                                                            type="text"
                                                            name="contactPerson"
                                                            value={currentEducation.contactPerson}
                                                            onChange={handleEducationInputChange}
                                                            className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 focus:ring-sky-500 text-sm font-medium"
                                                            placeholder="Contact person"
                                                        />
                                                    </div>

                                                    {/* Phone */}
                                                    <div className="space-y-2">
                                                        <label className="text-xs font-bold text-sky-600 uppercase tracking-wider">联系电话 Phone or Mobile</label>
                                                        <input
                                                            type="tel"
                                                            name="phone"
                                                            value={currentEducation.phone}
                                                            onChange={handleEducationInputChange}
                                                            className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 focus:ring-sky-500 text-sm font-medium"
                                                            placeholder="Contact Tel"
                                                        />
                                                    </div>

                                                    {/* Email */}
                                                    <div className="space-y-2">
                                                        <label className="text-xs font-bold text-sky-600 uppercase tracking-wider">邮箱 Email</label>
                                                        <input
                                                            type="email"
                                                            name="email"
                                                            value={currentEducation.email}
                                                            onChange={handleEducationInputChange}
                                                            className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 focus:ring-sky-500 text-sm font-medium"
                                                            placeholder="Email"
                                                        />
                                                    </div>

                                                    {/* Remark */}
                                                    <div className="space-y-2">
                                                        <label className="text-xs font-bold text-sky-600 uppercase tracking-wider">备注 Remark (GPA)</label>
                                                        <input
                                                            type="text"
                                                            name="gpa"
                                                            value={currentEducation.gpa}
                                                            onChange={handleEducationInputChange}
                                                            className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 focus:ring-sky-500 text-sm font-medium"
                                                            placeholder="GPA"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-center gap-4 mt-8 pt-8 border-t border-slate-100">
                                                    <button
                                                        onClick={handleAddEducation}
                                                        className="px-8 py-2.5 bg-[#5A9CF8] hover:bg-sky-600 text-white font-bold rounded-lg shadow-lg shadow-sky-200/50 transition-all flex items-center gap-2"
                                                    >
                                                        保存 Save
                                                    </button>
                                                    <button
                                                        onClick={() => setShowEducationForm(false)}
                                                        className="px-8 py-2.5 bg-white border border-sky-300 text-sky-500 font-bold rounded-lg hover:bg-sky-50 transition-all flex items-center gap-2"
                                                    >
                                                        关闭 Close
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* SECTION 5: Work Experience */}
                                <div id="work" className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 overflow-hidden border border-slate-100 animate-slideUp" style={{ animationDelay: '400ms' }}>
                                    <div className="bg-[#0EA5E9] px-8 py-5 flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center backdrop-blur-sm">
                                            <Diamond className="w-4 h-4 text-white fill-white" />
                                        </div>
                                        <h3 className="text-white font-bold text-lg tracking-tight">工作经历 Work Experience</h3>
                                    </div>
                                    <div className="p-8 lg:p-10">
                                        {/* Warning Text */}
                                        <div className="bg-slate-50 border border-slate-100 rounded-lg p-4 mb-6">
                                            <p className="text-xs text-slate-600 leading-relaxed">
                                                请按时间顺序，从最近的时间开始填写，两段经历的间隔最好不要超过6个月。<br />
                                                Please fill in from the latest time in chronological order. Any gap between two experiences is better NOT more than 6 months.
                                            </p>
                                        </div>

                                        {/* Summary Table */}
                                        <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm mb-6">
                                            <table className="w-full text-sm text-left">
                                                <thead className="bg-[#F8FAFC] text-slate-700 font-bold text-xs tracking-wider border-b border-slate-200">
                                                    <tr>
                                                        <th className="px-6 py-4">开始时间 Year of attendance (from)</th>
                                                        <th className="px-6 py-4">结束时间 Year of attendance (to)</th>
                                                        <th className="px-6 py-4">单位名称 Company</th>
                                                        <th className="px-6 py-4">职业 Occupation</th>
                                                        <th className="px-6 py-4">证明人 Reference</th>
                                                        <th className="px-6 py-4">联系电话 Phone/Mobile</th>
                                                        <th className="px-6 py-4">联系邮箱 Email</th>
                                                        <th className="px-6 py-4 text-right">
                                                            <button
                                                                onClick={() => setShowWorkForm(true)}
                                                                className={`text-sky-500 hover:text-sky-600 font-bold flex items-center justify-end gap-1 ml-auto ${showWorkForm ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                                disabled={showWorkForm}
                                                            >
                                                                Add 添加
                                                            </button>
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100">
                                                    {formData.workExperiences.length === 0 ? (
                                                        <tr>
                                                            <td colSpan="8" className="px-6 py-8 text-center text-slate-400 italic">
                                                                No work experience added. Please click "Add" to enter details.
                                                            </td>
                                                        </tr>
                                                    ) : (
                                                        formData.workExperiences.map((work, index) => (
                                                            <tr key={work.id || index} className="hover:bg-slate-50 transition-colors">
                                                                <td className="px-6 py-4 text-slate-600">{work.startDate}</td>
                                                                <td className="px-6 py-4 text-slate-600">{work.endDate}</td>
                                                                <td className="px-6 py-4 font-bold text-slate-700">{work.workPlace}</td>
                                                                <td className="px-6 py-4 text-slate-600">{work.occupation}</td>
                                                                <td className="px-6 py-4 text-slate-600">{work.contactPerson}</td>
                                                                <td className="px-6 py-4 text-slate-600">{work.phone}</td>
                                                                <td className="px-6 py-4 text-slate-600">{work.email}</td>
                                                                <td className="px-6 py-4 text-right">
                                                                    <button
                                                                        onClick={() => removeWork(work.id)}
                                                                        className="text-rose-400 hover:text-rose-600 transition-colors"
                                                                    >
                                                                        <Trash2 className="w-4 h-4" />
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        ))
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* Add Work Form */}
                                        {showWorkForm && (
                                            <div className="bg-slate-50 rounded-xl p-6 lg:p-8 border border-sky-100 animate-fadeIn mb-8">
                                                <h4 className="font-bold text-slate-700 mb-6 flex items-center gap-2">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-sky-500"></span>
                                                    Add Work Experience
                                                </h4>

                                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                                    {/* Start Date */}
                                                    <div className="space-y-2">
                                                        <label className="text-xs font-bold text-sky-600 uppercase tracking-wider">开始时间 Year of attendance (from)<span className="text-rose-500">*</span></label>
                                                        <input
                                                            type="date"
                                                            name="startDate"
                                                            value={currentWorkExperience.startDate}
                                                            onChange={handleWorkInputChange}
                                                            className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 focus:ring-sky-500 text-sm font-medium text-slate-600"
                                                        />
                                                    </div>

                                                    {/* End Date */}
                                                    <div className="space-y-2">
                                                        <label className="text-xs font-bold text-sky-600 uppercase tracking-wider">截止时间 Year of attendance (to)<span className="text-rose-500">*</span></label>
                                                        <input
                                                            type="date"
                                                            name="endDate"
                                                            value={currentWorkExperience.endDate}
                                                            onChange={handleWorkInputChange}
                                                            className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 focus:ring-sky-500 text-sm font-medium text-slate-600"
                                                        />
                                                    </div>

                                                    {/* Work Place */}
                                                    <div className="space-y-2">
                                                        <label className="text-xs font-bold text-sky-600 uppercase tracking-wider">单位名称 Work Place<span className="text-rose-500">*</span></label>
                                                        <input
                                                            type="text"
                                                            name="workPlace"
                                                            value={currentWorkExperience.workPlace}
                                                            onChange={handleWorkInputChange}
                                                            className="w-full bg-white border border-rose-300 rounded-lg px-4 py-2.5 focus:ring-sky-500 text-sm font-medium"
                                                            placeholder="Work Place"
                                                        />
                                                    </div>

                                                    {/* Industry Type */}
                                                    <div className="space-y-2">
                                                        <label className="text-xs font-bold text-sky-600 uppercase tracking-wider">行业类型 Industry Type<span className="text-rose-500">*</span></label>
                                                        <select
                                                            name="industryType"
                                                            value={currentWorkExperience.industryType}
                                                            onChange={handleWorkInputChange}
                                                            className="w-full bg-white border border-rose-300 rounded-lg px-4 py-2.5 focus:ring-sky-500 text-sm font-bold text-[#4F46E5]"
                                                        >
                                                            <option value="">请选择 Please Choose</option>
                                                            {INDUSTRY_TYPES.map(type => (
                                                                <option key={type.value} value={type.value}>{type.name}</option>
                                                            ))}
                                                        </select>
                                                    </div>

                                                    {/* Occupation */}
                                                    <div className="space-y-2">
                                                        <label className="text-xs font-bold text-sky-600 uppercase tracking-wider">职业 Occupation<span className="text-rose-500">*</span></label>
                                                        <select
                                                            name="occupation"
                                                            value={currentWorkExperience.occupation}
                                                            onChange={handleWorkInputChange}
                                                            className="w-full bg-white border border-rose-300 rounded-lg px-4 py-2.5 focus:ring-sky-500 text-sm font-bold text-[#4F46E5]"
                                                        >
                                                            <option value="">请选择 Please Choose</option>
                                                            {OCCUPATIONS.map(occ => (
                                                                <option key={occ.value} value={occ.value}>{occ.name}</option>
                                                            ))}
                                                        </select>
                                                    </div>

                                                    {/* Phone */}
                                                    <div className="space-y-2">
                                                        <label className="text-xs font-bold text-sky-600 uppercase tracking-wider">联系电话 Phone or Mobile<span className="text-rose-500">*</span></label>
                                                        <input
                                                            type="tel"
                                                            name="phone"
                                                            value={currentWorkExperience.phone}
                                                            onChange={handleWorkInputChange}
                                                            className="w-full bg-white border border-rose-300 rounded-lg px-4 py-2.5 focus:ring-sky-500 text-sm font-medium"
                                                            placeholder="Phone or Mobile"
                                                        />
                                                    </div>

                                                    {/* Contact Person */}
                                                    <div className="space-y-2">
                                                        <label className="text-xs font-bold text-sky-600 uppercase tracking-wider">联系人 Contact person<span className="text-rose-500">*</span></label>
                                                        <input
                                                            type="text"
                                                            name="contactPerson"
                                                            value={currentWorkExperience.contactPerson}
                                                            onChange={handleWorkInputChange}
                                                            className="w-full bg-white border border-rose-300 rounded-lg px-4 py-2.5 focus:ring-sky-500 text-sm font-medium"
                                                            placeholder="Contact person"
                                                        />
                                                    </div>

                                                    {/* Email */}
                                                    <div className="space-y-2">
                                                        <label className="text-xs font-bold text-sky-600 uppercase tracking-wider">邮箱 Email<span className="text-rose-500">*</span></label>
                                                        <input
                                                            type="email"
                                                            name="email"
                                                            value={currentWorkExperience.email}
                                                            onChange={handleWorkInputChange}
                                                            className="w-full bg-white border border-rose-300 rounded-lg px-4 py-2.5 focus:ring-sky-500 text-sm font-medium"
                                                            placeholder="Contact person" // Placeholder matches image text which seems duplicated, keeping consistent
                                                        />
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-center gap-4 mt-8 pt-8 border-t border-slate-100">
                                                    <button
                                                        onClick={handleAddWork}
                                                        className="px-8 py-2.5 bg-[#5A9CF8] hover:bg-sky-600 text-white font-bold rounded-lg shadow-lg shadow-sky-200/50 transition-all flex items-center gap-2"
                                                    >
                                                        保存 Save
                                                    </button>
                                                    <button
                                                        onClick={() => setShowWorkForm(false)}
                                                        className="px-8 py-2.5 bg-white border border-sky-300 text-sky-500 font-bold rounded-lg hover:bg-sky-50 transition-all flex items-center gap-2"
                                                    >
                                                        关闭 Close
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {/* Work in China Questions */}
                                        <div className="space-y-6 pt-6 border-t border-slate-100">
                                            <div className="space-y-3">
                                                <label className="text-xs font-bold text-sky-600 uppercase tracking-wider">是否曾经在华工作 Have you ever worked in China?<span className="text-rose-500">*</span></label>
                                                <div className="flex gap-6">
                                                    {['Yes', 'No'].map(opt => (
                                                        <label key={opt} className="flex items-center gap-3 cursor-pointer group">
                                                            <div className="relative flex items-center justify-center">
                                                                <input
                                                                    type="radio"
                                                                    name="workedInChina"
                                                                    value={opt}
                                                                    checked={formData.workedInChina === opt}
                                                                    onChange={handleInputChange}
                                                                    className="peer appearance-none w-5 h-5 border-2 border-slate-200 rounded-full checked:border-sky-500 transition-all"
                                                                />
                                                                <div className="absolute w-2.5 h-2.5 bg-sky-500 rounded-full scale-0 peer-checked:scale-100 transition-all"></div>
                                                            </div>
                                                            <span className={`text-sm font-bold ${formData.workedInChina === opt ? 'text-sky-600' : 'text-slate-500'}`}>{opt}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="space-y-6 animate-fadeIn">
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold text-sky-600 uppercase tracking-wider">在华工作单位 Work Place in China</label>
                                                    <input
                                                        type="text"
                                                        name="chinaWorkPlace"
                                                        value={formData.chinaWorkPlace}
                                                        onChange={handleInputChange}
                                                        className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 focus:ring-sky-500 text-sm font-medium"
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold text-sky-600 uppercase tracking-wider">在华工作期限 Working Duration in China</label>
                                                    <div className="grid grid-cols-2 gap-4 items-center">
                                                        <input
                                                            type="date"
                                                            name="chinaWorkStartDate"
                                                            value={formData.chinaWorkStartDate}
                                                            onChange={handleInputChange}
                                                            className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 focus:ring-sky-500 text-sm font-medium text-slate-600"
                                                            placeholder="From"
                                                        />
                                                        <div className="flex items-center gap-4">
                                                            <span className="text-slate-400 font-bold">-</span>
                                                            <input
                                                                type="date"
                                                                name="chinaWorkEndDate"
                                                                value={formData.chinaWorkEndDate}
                                                                onChange={handleInputChange}
                                                                className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 focus:ring-sky-500 text-sm font-medium text-slate-600"
                                                                placeholder="to"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* SECTION 6: Family Members */}
                                <div id="family" className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 overflow-hidden border border-slate-100 animate-slideUp" style={{ animationDelay: '500ms' }}>
                                    <div className="bg-[#0EA5E9] px-8 py-5 flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center backdrop-blur-sm">
                                            <Diamond className="w-4 h-4 text-white fill-white" />
                                        </div>
                                        <h3 className="text-white font-bold text-lg tracking-tight">家庭成员信息 Family Members <span className="text-rose-200">*</span></h3>
                                    </div>
                                    <div className="p-8 lg:p-10">
                                        {/* Warning Text */}
                                        <div className="bg-slate-50 border border-slate-100 rounded-lg p-4 mb-6">
                                            <p className="text-xs text-slate-600 leading-relaxed">
                                                请务必填写父母信息，可增加其他家庭成员。<br />
                                                The parents' information is required.<br />
                                                请填写至少两条家庭成员信息！<br />
                                                Please input at least two family members information
                                            </p>
                                        </div>

                                        {/* Summary Table */}
                                        <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm mb-6">
                                            <table className="w-full text-sm text-left">
                                                <thead className="bg-[#F8FAFC] text-slate-700 font-bold text-xs tracking-wider border-b border-slate-200">
                                                    <tr>
                                                        <th className="px-6 py-4">姓名 Name</th>
                                                        <th className="px-6 py-4">关系 Relationship</th>
                                                        <th className="px-6 py-4">国籍 Nationality</th>
                                                        <th className="px-6 py-4">单位名称 Work Place</th>
                                                        <th className="px-6 py-4">职业 Occupation</th>
                                                        <th className="px-6 py-4">联系电话 Phone/Mobile</th>
                                                        <th className="px-6 py-4">联系邮箱 Email</th>
                                                        <th className="px-6 py-4 text-right">
                                                            <button
                                                                onClick={() => setShowFamilyForm(true)}
                                                                className={`text-sky-500 hover:text-sky-600 font-bold flex items-center justify-end gap-1 ml-auto ${showFamilyForm ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                                disabled={showFamilyForm}
                                                            >
                                                                Add 添加
                                                            </button>
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100">
                                                    {formData.familyMembers.length === 0 ? (
                                                        <tr>
                                                            <td colSpan="8" className="px-6 py-8 text-center text-slate-400 italic">
                                                                No family members added. Please add at least two (Parents).
                                                            </td>
                                                        </tr>
                                                    ) : (
                                                        formData.familyMembers.map((member, index) => (
                                                            <tr key={member.id || index} className="hover:bg-slate-50 transition-colors">
                                                                <td className="px-6 py-4 font-bold text-slate-700">{member.name}</td>
                                                                <td className="px-6 py-4 text-slate-600">{member.relationship}</td>
                                                                <td className="px-6 py-4 text-slate-600">{member.nationality}</td>
                                                                <td className="px-6 py-4 text-slate-600">{member.workPlace}</td>
                                                                <td className="px-6 py-4 text-slate-600">{member.occupation}</td>
                                                                <td className="px-6 py-4 text-slate-600">{member.phone}</td>
                                                                <td className="px-6 py-4 text-slate-600">{member.email}</td>
                                                                <td className="px-6 py-4 text-right">
                                                                    <button
                                                                        onClick={() => removeFamily(member.id)}
                                                                        className="text-rose-400 hover:text-rose-600 transition-colors"
                                                                    >
                                                                        <Trash2 className="w-4 h-4" />
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        ))
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* Add Family Form */}
                                        {showFamilyForm && (
                                            <div className="bg-slate-50 rounded-xl p-6 lg:p-8 border border-sky-100 animate-fadeIn mb-8">
                                                <h4 className="font-bold text-slate-700 mb-6 flex items-center gap-2">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-sky-500"></span>
                                                    Add Family Member
                                                </h4>

                                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                                    {/* Name */}
                                                    <div className="space-y-2">
                                                        <label className="text-xs font-bold text-sky-600 uppercase tracking-wider">姓名 Name<span className="text-rose-500">*</span></label>
                                                        <input
                                                            type="text"
                                                            name="name"
                                                            value={currentFamilyMember.name}
                                                            onChange={handleFamilyInputChange}
                                                            className="w-full bg-white border border-rose-300 rounded-lg px-4 py-2.5 focus:ring-sky-500 text-sm font-medium"
                                                            placeholder="Name"
                                                        />
                                                    </div>

                                                    {/* Relationship */}
                                                    <div className="space-y-2">
                                                        <label className="text-xs font-bold text-sky-600 uppercase tracking-wider">关系 Relationship with the student<span className="text-rose-500">*</span></label>
                                                        <select
                                                            name="relationship"
                                                            value={currentFamilyMember.relationship}
                                                            onChange={handleFamilyInputChange}
                                                            className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 focus:ring-sky-500 text-sm font-bold text-[#4F46E5]"
                                                        >
                                                            <option value="">无 None</option>
                                                            {['Spouse', 'Father', 'Mother', 'Son', 'Daughter', 'Brother', 'Sister', 'Uncle', 'Aunt', 'Cousin', 'Friend', 'Other'].map(rel => (
                                                                <option key={rel} value={rel}>{rel}</option>
                                                            ))}
                                                        </select>
                                                    </div>

                                                    {/* Work Place */}
                                                    <div className="space-y-2">
                                                        <label className="text-xs font-bold text-sky-600 uppercase tracking-wider">单位名称 Work Place<span className="text-rose-500">*</span></label>
                                                        <input
                                                            type="text"
                                                            name="workPlace"
                                                            value={currentFamilyMember.workPlace}
                                                            onChange={handleFamilyInputChange}
                                                            className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 focus:ring-sky-500 text-sm font-medium"
                                                            placeholder="Name of Institute/Employer"
                                                        />
                                                    </div>

                                                    {/* Nationality */}
                                                    <div className="space-y-2">
                                                        <label className="text-xs font-bold text-sky-600 uppercase tracking-wider">国籍 Nationality<span className="text-rose-500">*</span></label>
                                                        <select
                                                            name="nationality"
                                                            value={currentFamilyMember.nationality}
                                                            onChange={handleFamilyInputChange}
                                                            className="w-full bg-white border border-rose-300 rounded-lg px-4 py-2.5 focus:ring-sky-500 text-sm font-bold text-[#4F46E5]"
                                                        >
                                                            <option value="">请选择 Please Choose</option>
                                                            {NATIONALITIES.map(nat => (
                                                                <option key={nat.value} value={nat.value}>{nat.name}</option>
                                                            ))}
                                                        </select>
                                                    </div>

                                                    {/* Occupation */}
                                                    <div className="space-y-2">
                                                        <label className="text-xs font-bold text-sky-600 uppercase tracking-wider">职业 Occupation<span className="text-rose-500">*</span></label>
                                                        <select
                                                            name="occupation"
                                                            value={currentFamilyMember.occupation}
                                                            onChange={handleFamilyInputChange}
                                                            className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 focus:ring-sky-500 text-sm font-bold text-[#4F46E5]"
                                                        >
                                                            <option value="">请选择 Please Choose</option>
                                                            {OCCUPATIONS.map(occ => (
                                                                <option key={occ.value} value={occ.value}>{occ.name}</option>
                                                            ))}
                                                        </select>
                                                    </div>

                                                    {/* Industry Type */}
                                                    <div className="space-y-2">
                                                        <label className="text-xs font-bold text-sky-600 uppercase tracking-wider">行业类型 Industry Type<span className="text-rose-500">*</span></label>
                                                        <select
                                                            name="industryType"
                                                            value={currentFamilyMember.industryType}
                                                            onChange={handleFamilyInputChange}
                                                            className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 focus:ring-sky-500 text-sm font-bold text-[#4F46E5]"
                                                        >
                                                            <option value="">请选择 Please Choose</option>
                                                            {INDUSTRY_TYPES.map(type => (
                                                                <option key={type.value} value={type.value}>{type.name}</option>
                                                            ))}
                                                        </select>
                                                    </div>

                                                    {/* Email */}
                                                    <div className="space-y-2">
                                                        <label className="text-xs font-bold text-sky-600 uppercase tracking-wider">邮箱 Email：<span className="text-rose-500"></span></label>
                                                        <input
                                                            type="email"
                                                            name="email"
                                                            value={currentFamilyMember.email}
                                                            onChange={handleFamilyInputChange}
                                                            className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 focus:ring-sky-500 text-sm font-medium"
                                                            placeholder="Contact Email"
                                                        />
                                                    </div>

                                                    {/* Phone */}
                                                    <div className="space-y-2">
                                                        <label className="text-xs font-bold text-sky-600 uppercase tracking-wider">电话 Phone or Mobile<span className="text-rose-500">*</span></label>
                                                        <input
                                                            type="tel"
                                                            name="phone"
                                                            value={currentFamilyMember.phone}
                                                            onChange={handleFamilyInputChange}
                                                            className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 focus:ring-sky-500 text-sm font-medium"
                                                            placeholder="Contact Tel"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-center gap-4 mt-8 pt-8 border-t border-slate-100">
                                                    <button
                                                        onClick={handleAddFamily}
                                                        className="px-8 py-2.5 bg-[#5A9CF8] hover:bg-sky-600 text-white font-bold rounded-lg shadow-lg shadow-sky-200/50 transition-all flex items-center gap-2"
                                                    >
                                                        保存 Save
                                                    </button>
                                                    <button
                                                        onClick={() => setShowFamilyForm(false)}
                                                        className="px-8 py-2.5 bg-white border border-sky-300 text-sky-500 font-bold rounded-lg hover:bg-sky-50 transition-all flex items-center gap-2"
                                                    >
                                                        关闭 Close
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Footer Actions for Tab 2 */}
                                <div className="flex items-center justify-end gap-4 w-full pt-10 border-t border-slate-200">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setActiveMainTab(prev => prev - 1)
                                            window.scrollTo({ top: 0, behavior: 'smooth' })
                                        }}
                                        className="px-6 py-2.5 border border-sky-500 text-sky-500 font-medium rounded-md hover:bg-sky-50 transition-colors"
                                    >
                                        返回 Back
                                    </button>

                                    <button
                                        type="button"
                                        onClick={async () => {
                                            await handleSaveDraft()
                                            if (activeMainTab < 5) {
                                                setActiveMainTab(prev => prev + 1)
                                                window.scrollTo({ top: 0, behavior: 'smooth' })
                                            }
                                        }}
                                        disabled={saving}
                                        className="px-6 py-2.5 bg-[#1e40af] text-white font-medium rounded-md hover:bg-blue-800 transition-colors shadow-sm disabled:opacity-50"
                                    >
                                        {saving ? 'Saving...' : '保存并继续 Save and Continue'}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => {
                                            setActiveMainTab(prev => prev + 1)
                                            window.scrollTo({ top: 0, behavior: 'smooth' })
                                        }}
                                        className="px-6 py-2.5 border border-sky-500 text-sky-500 font-medium rounded-md hover:bg-sky-50 transition-colors"
                                    >
                                        下一步 Next
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* ================= TAB 3: DOCUMENTS ================= */}
                        {activeMainTab === 3 && (
                            <div className="max-w-5xl mx-auto space-y-8 animate-slideUp">
                                {/* Header */}
                                <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 overflow-hidden border border-slate-100">
                                    <div className="bg-[#0EA5E9] px-8 py-5 flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center backdrop-blur-sm">
                                            <Diamond className="w-4 h-4 text-white fill-white" />
                                        </div>
                                        <h3 className="text-white font-bold text-lg tracking-tight">申请人材料 Application Documents</h3>
                                    </div>
                                    <div className="p-8 lg:p-10">
                                        <h4 className="text-sky-500 font-bold mb-4 uppercase tracking-wider text-sm">上传材料 UPLOAD DOCUMENTS</h4>
                                        <div className="bg-slate-50 border border-slate-100 rounded-lg p-4 mb-8">
                                            <p className="text-xs text-slate-600 leading-relaxed">
                                                The uploaded file type needs to be *.jpg,*.jpeg,*.png,*.bmp,*.doc,*.docx,*.pdf,*.xls,*.xlsx Maximum file size 5M
                                                <span className="text-rose-500">*</span>
                                            </p>
                                        </div>

                                        <div className="space-y-0 divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                                            {/* Row 1: Passport */}
                                            <div className="bg-white p-6 grid grid-cols-1 md:grid-cols-3 gap-4 items-center hover:bg-slate-50 transition-colors">
                                                <div className="md:col-span-2">
                                                    <p className="text-sm font-bold text-[#44669E]">
                                                        护照照片页扫描件和中国签证页扫描件 Scanned Copy of Passport Photo Page and Chinese Visa Page
                                                        <span className="text-rose-500">*</span>
                                                    </p>
                                                </div>
                                                <div className="relative w-full">
                                                    <input
                                                        type="file"
                                                        onChange={async (e) => {
                                                            const file = e.target.files[0]
                                                            if (file) {
                                                                const url = await uploadFile(file, 'passportPhotoPage')
                                                                if (url) {
                                                                    setFormData(prev => ({
                                                                        ...prev,
                                                                        documents: {
                                                                            ...prev.documents,
                                                                            passportPhotoPage: url
                                                                        }
                                                                    }))
                                                                    showToast('Passport Photo Page uploaded successfully', 'success')
                                                                }
                                                            }
                                                        }}
                                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                                                        accept="image/*,application/pdf"
                                                        disabled={uploadingStatus.passportPhotoPage}
                                                    />
                                                    <button type="button" className="w-full py-3 bg-white border-2 border-dashed border-slate-200 text-slate-500 rounded-xl text-xs font-bold hover:bg-slate-50 hover:border-sky-300 transition-all flex items-center justify-center gap-2 group disabled:opacity-50">
                                                        {uploadingStatus.passportPhotoPage ? <Loader2 size={16} className="animate-spin text-sky-500" /> : <Upload size={16} className="group-hover:text-sky-500 transition-colors" />}
                                                        {uploadingStatus.passportPhotoPage ? 'Uploading...' : 'Browser... 浏览器'}
                                                    </button>
                                                </div>
                                            </div>
                                            {formData.documents.passportPhotoPage && (
                                                <div className="mt-4 p-4 bg-emerald-50 rounded-xl flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shadow-sm">
                                                        <Check size={16} />
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-xs font-bold text-emerald-800">File Uploaded Successfully</p>
                                                        <p className="text-[10px] text-emerald-600 mt-0.5 whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px]">
                                                            {typeof formData.documents.passportPhotoPage === 'string' ? 'Cloudinary-File-Link' : formData.documents.passportPhotoPage.name}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Row 2: Highest Degree */}
                                        <div className="bg-[#F8FAFC]/50 p-6 grid grid-cols-1 md:grid-cols-3 gap-4 items-center hover:bg-slate-50 transition-colors">
                                            <div className="md:col-span-2">
                                                <p className="text-sm font-bold text-[#44669E]">
                                                    经公证的最高学历证明或在学证明（中文或英文）扫描件 Scanned Copy of Notarized Highest Degree Certificate or Enrollment Certificate (In Chinese or English)
                                                    <span className="text-rose-500">*</span>
                                                </p>
                                            </div>
                                            <div className="relative">
                                                <input
                                                    type="file"
                                                    onChange={(e) => handleFileChange(e, 'highestDegreeCertificate')}
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                                                    disabled={uploadingStatus.highestDegreeCertificate}
                                                />
                                                <button type="button" className="px-4 py-2 bg-[#3B82F6] text-white text-xs font-bold rounded shadow-sm hover:bg-blue-600 transition-colors flex items-center gap-2 disabled:opacity-50">
                                                    {uploadingStatus.highestDegreeCertificate ? <Loader2 size={14} className="animate-spin" /> : null}
                                                    {uploadingStatus.highestDegreeCertificate ? 'Uploading...' : 'Choose File 上传'}
                                                </button>
                                            </div>
                                        </div>
                                        {formData.documents.highestDegreeCertificate && (
                                            <div className="md:col-span-3 text-right">
                                                <span className="text-xs text-emerald-600 font-bold flex items-center justify-end gap-1">
                                                    <Check className="w-3 h-3" /> {typeof formData.documents.highestDegreeCertificate === 'string' ? 'File Uploaded' : `Selected: ${formData.documents.highestDegreeCertificate.name}`}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Row 3: Transcripts */}
                                    <div className="bg-white p-6 grid grid-cols-1 md:grid-cols-3 gap-4 items-center hover:bg-slate-50 transition-colors">
                                        <div className="md:col-span-2">
                                            <p className="text-sm font-bold text-[#44669E]">
                                                经公证的学习成绩单（本科及以上阶段，中文或英文）扫描件 Scanned Copy of Notarized Academic Transcripts (for Bachelor's Degree & Above, In Chinese or English)
                                                <span className="text-rose-500">*</span>
                                            </p>
                                        </div>
                                        <div className="relative">
                                            <input
                                                type="file"
                                                onChange={(e) => handleFileChange(e, 'academicTranscripts')}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                                                disabled={uploadingStatus.academicTranscripts}
                                            />
                                            <button type="button" className="px-4 py-2 bg-[#3B82F6] text-white text-xs font-bold rounded shadow-sm hover:bg-blue-600 transition-colors flex items-center gap-2 disabled:opacity-50">
                                                {uploadingStatus.academicTranscripts ? <Loader2 size={14} className="animate-spin" /> : null}
                                                {uploadingStatus.academicTranscripts ? 'Uploading...' : 'Choose File 上传'}
                                            </button>
                                        </div>
                                    </div>
                                    {formData.documents.academicTranscripts && (
                                        <div className="md:col-span-3 text-right">
                                            <span className="text-xs text-emerald-600 font-bold flex items-center justify-end gap-1">
                                                <Check className="w-3 h-3" /> {typeof formData.documents.academicTranscripts === 'string' ? 'File Uploaded' : `Selected: ${formData.documents.academicTranscripts.name}`}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Row 4: Language Proficiency */}
                                <div className="bg-[#F8FAFC]/50 p-6 grid grid-cols-1 md:grid-cols-3 gap-4 items-center hover:bg-slate-50 transition-colors">
                                    <div className="md:col-span-2">
                                        <p className="text-sm font-bold text-[#44669E]">
                                            语言能力证明扫描件 Scanned Copy of Language Proficiency Certificate
                                            <span className="text-rose-500">*</span>
                                        </p>
                                    </div>
                                    <div className="flex justify-end gap-2">
                                        <div className="relative">
                                            <input
                                                type="file"
                                                onChange={(e) => handleFileChange(e, 'languageCertificate')}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                                                disabled={uploadingStatus.languageCertificate}
                                            />
                                            <button type="button" className="px-4 py-2 bg-[#3B82F6] text-white text-xs font-bold rounded shadow-sm hover:bg-blue-600 transition-colors flex items-center gap-2 disabled:opacity-50">
                                                {uploadingStatus.languageCertificate ? <Loader2 size={14} className="animate-spin" /> : null}
                                                {uploadingStatus.languageCertificate ? 'Uploading...' : 'Choose File 上传'}
                                            </button>
                                        </div>
                                    </div>
                                    {formData.documents.languageCertificate && (
                                        <div className="md:col-span-3 text-right">
                                            <span className="text-xs text-emerald-600 font-bold flex items-center justify-end gap-1">
                                                <Check className="w-3 h-3" /> {typeof formData.documents.languageCertificate === 'string' ? 'File Uploaded' : `Selected: ${formData.documents.languageCertificate.name}`}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Row 5: Physical Exam (Special Layout) */}
                                <div className="bg-white p-6 hover:bg-slate-50 transition-colors">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                                        <div className="md:col-span-2 space-y-2">
                                            <p className="text-sm font-bold text-[#44669E]">
                                                外国人体格检查表扫描件 Foreigner Physical Examination Form
                                                <span className="text-rose-500">*</span>
                                            </p>
                                            <a href="#" className="flex items-center gap-2 text-xs text-[#44669E] hover:underline hover:text-sky-600 w-fit">
                                                <img src="https://cdn-icons-png.flaticon.com/512/337/337946.png" className="w-4 h-4" alt="pdf" />
                                                体检表foreign physical examination form.pdf
                                            </a>
                                            <p className="text-[10px] text-slate-500">
                                                Applicants are required to complete the Physical Examination strictly, and test in recent 6 months.
                                            </p>
                                        </div>
                                        <div className="flex justify-end gap-2 items-start">
                                            <div className="relative">
                                                <input
                                                    type="file"
                                                    onChange={(e) => handleFileChange(e, 'physicalExamForm')}
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                                                    disabled={uploadingStatus.physicalExamForm}
                                                />
                                                <button type="button" className="px-4 py-2 bg-[#3B82F6] text-white text-xs font-bold rounded shadow-sm hover:bg-blue-600 transition-colors flex items-center gap-2 disabled:opacity-50">
                                                    {uploadingStatus.physicalExamForm ? <Loader2 size={14} className="animate-spin" /> : null}
                                                    {uploadingStatus.physicalExamForm ? 'Uploading...' : 'Choose File 上传'}
                                                </button>
                                            </div>
                                        </div>
                                        {formData.documents.physicalExamForm && (
                                            <div className="md:col-span-3 text-right">
                                                <span className="text-xs text-emerald-600 font-bold flex items-center justify-end gap-1">
                                                    <Check className="w-3 h-3" /> {typeof formData.documents.physicalExamForm === 'string' ? 'File Uploaded' : `Selected: ${formData.documents.physicalExamForm.name}`}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Row 6: Economic Guarantee */}
                                <div className="bg-[#F8FAFC]/50 p-6 grid grid-cols-1 md:grid-cols-3 gap-4 items-center hover:bg-slate-50 transition-colors">
                                    <div className="md:col-span-2">
                                        <p className="text-sm font-bold text-sky-500">
                                            经费担保证明（银行存款证明） Proof of economic guarantee.
                                        </p>
                                    </div>
                                    <div className="flex justify-end gap-2">
                                        <div className="relative">
                                            <input
                                                type="file"
                                                onChange={(e) => handleFileChange(e, 'economicGuarantee')}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                                                disabled={uploadingStatus.economicGuarantee}
                                            />
                                            <button type="button" className="px-4 py-2 bg-[#3B82F6] text-white text-xs font-bold rounded shadow-sm hover:bg-blue-600 transition-colors flex items-center gap-2 disabled:opacity-50">
                                                {uploadingStatus.economicGuarantee ? <Loader2 size={14} className="animate-spin" /> : null}
                                                {uploadingStatus.economicGuarantee ? 'Uploading...' : 'Choose File 上传'}
                                            </button>
                                        </div>
                                    </div>
                                    {formData.documents.economicGuarantee && (
                                        <div className="md:col-span-3 text-right">
                                            <span className="text-xs text-emerald-600 font-bold flex items-center justify-end gap-1">
                                                <Check className="w-3 h-3" /> {typeof formData.documents.economicGuarantee === 'string' ? 'File Uploaded' : `Selected: ${formData.documents.economicGuarantee.name}`}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Row 7: No Criminal Record */}
                                <div className="bg-white p-6 grid grid-cols-1 md:grid-cols-3 gap-4 items-center hover:bg-slate-50 transition-colors">
                                    <div className="md:col-span-2">
                                        <p className="text-sm font-bold text-sky-500">
                                            无犯罪记录证明扫描件 Scanned Copy of No Criminal Record Certificate
                                            <span className="text-rose-500">*</span>
                                        </p>
                                        <p className="text-[10px] text-slate-500 mt-1">Non-criminal commitment, get in recent 6 months.</p>
                                    </div>
                                    <div className="flex justify-end gap-2">
                                        <div className="relative">
                                            <input
                                                type="file"
                                                onChange={(e) => handleFileChange(e, 'noCriminalRecord')}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                                                disabled={uploadingStatus.noCriminalRecord}
                                            />
                                            <button type="button" className="px-4 py-2 bg-[#3B82F6] text-white text-xs font-bold rounded shadow-sm hover:bg-blue-600 transition-colors flex items-center gap-2 disabled:opacity-50">
                                                {uploadingStatus.noCriminalRecord ? <Loader2 size={14} className="animate-spin" /> : null}
                                                {uploadingStatus.noCriminalRecord ? 'Uploading...' : 'Choose File 上传'}
                                            </button>
                                        </div>
                                    </div>
                                    {formData.documents.noCriminalRecord && (
                                        <div className="md:col-span-3 text-right">
                                            <span className="text-xs text-emerald-600 font-bold flex items-center justify-end gap-1">
                                                <Check className="w-3 h-3" /> {typeof formData.documents.noCriminalRecord === 'string' ? 'File Uploaded' : `Selected: ${formData.documents.noCriminalRecord.name}`}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Row 8: Guardianship Letter */}
                                <div className="bg-[#F8FAFC]/50 p-6 grid grid-cols-1 md:grid-cols-3 gap-4 items-center hover:bg-slate-50 transition-colors">
                                    <div className="md:col-span-2">
                                        <p className="text-sm font-bold text-sky-500">
                                            监护人委托书 Guardianship Authorization Letter
                                        </p>
                                        <p className="text-[10px] text-slate-500 mt-1">
                                            未满18岁申请者必上传材料<br />
                                            Application materials for the student under the age of 18.
                                        </p>
                                    </div>
                                    <div className="flex justify-end gap-2">
                                        <div className="relative">
                                            <input
                                                type="file"
                                                onChange={(e) => handleFileChange(e, 'guardianshipLetter')}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                                                disabled={uploadingStatus.guardianshipLetter}
                                            />
                                            <button type="button" className="px-4 py-2 bg-[#3B82F6] text-white text-xs font-bold rounded shadow-sm hover:bg-blue-600 transition-colors flex items-center gap-2 disabled:opacity-50">
                                                {uploadingStatus.guardianshipLetter ? <Loader2 size={14} className="animate-spin" /> : null}
                                                {uploadingStatus.guardianshipLetter ? 'Uploading...' : 'Choose File 上传'}
                                            </button>
                                        </div>
                                    </div>
                                    {formData.documents.guardianshipLetter && (
                                        <div className="md:col-span-3 text-right">
                                            <span className="text-xs text-emerald-600 font-bold flex items-center justify-end gap-1">
                                                <Check className="w-3 h-3" /> {typeof formData.documents.guardianshipLetter === 'string' ? 'File Uploaded' : `Selected: ${formData.documents.guardianshipLetter.name}`}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Row 9: Other Documents */}
                                <div className="bg-white p-6 grid grid-cols-1 md:grid-cols-3 gap-4 items-center hover:bg-slate-50 transition-colors">
                                    <div className="md:col-span-2">
                                        <p className="text-sm font-bold text-sky-500">
                                            其他支撑材料 Additional Supplementary Materials
                                        </p>
                                    </div>
                                    <div className="flex justify-end gap-2">
                                        <div className="relative">
                                            <input
                                                type="file"
                                                onChange={(e) => handleFileChange(e, 'otherDocuments')}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                                                disabled={uploadingStatus.otherDocuments}
                                            />
                                            <button type="button" className="px-4 py-2 bg-[#3B82F6] text-white text-xs font-bold rounded shadow-sm hover:bg-blue-600 transition-colors flex items-center gap-2 disabled:opacity-50">
                                                {uploadingStatus.otherDocuments ? <Loader2 size={14} className="animate-spin" /> : null}
                                                {uploadingStatus.otherDocuments ? 'Uploading...' : 'Choose File 上传'}
                                            </button>
                                        </div>
                                    </div>
                                    {formData.documents.otherDocuments && (
                                        <div className="md:col-span-3 text-right">
                                            <span className="text-xs text-emerald-600 font-bold flex items-center justify-end gap-1">
                                                <Check className="w-3 h-3" /> {typeof formData.documents.otherDocuments === 'string' ? 'File Uploaded' : `Selected: ${formData.documents.otherDocuments.name}`}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Row 10: Certificate of Payment (Special Layout) */}
                                <div className="bg-[#F8FAFC]/50 p-6 hover:bg-slate-50 transition-colors">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                                        <div className="md:col-span-2 space-y-4">
                                            <p className="text-sm font-bold text-sky-500">
                                                缴费凭证 Certificate of Payment
                                            </p>
                                            <div className="text-[10px] text-slate-500 space-y-3 leading-relaxed">
                                                <p>你好，感谢申请哈尔滨工程大学。现需要支付报名费 260 元人民币，以便提交申请材料。具体支付信息请参阅以下内容。</p>
                                                <p>
                                                    从中国大陆境内向学校汇款，账号信息如下<br />
                                                    户名：哈尔滨工程大学<br />
                                                    账号：3500040709008802226<br />
                                                    开户银行：中国工商银行股份有限公司哈尔滨宣桥支行
                                                </p>
                                                <p>
                                                    从中国大陆以外地区向学校汇款，账号信息如下：<br />
                                                    户名：HARBIN ENGINEERING UNIVERSITY<br />
                                                    账号：3500040709008802226<br />
                                                    银行名称：INDUSTRIAL AND COMMERCIAL BANK OF CHINA HARBIN CITY BRANCH<br />
                                                    收款人银行地址：No.318, East Dazhi Street, Harbin, China<br />
                                                    交换码：ICBKCNBJHLJ
                                                </p>
                                                <hr className="border-slate-200" />
                                                <p>Thank you for applying to Harbin Engineering University.</p>
                                                <p>A payment of the 260CNY application fee is now required in order to submit your application materials.</p>
                                                <p>Please refer to the details below for payment information.</p>
                                                <div className="pt-2 text-slate-600 font-medium">
                                                    <p className="font-bold">FROM MAINLAND CHINA</p>
                                                    <p>Account Name: 哈尔滨工程大学</p>
                                                    <p>Account Number: 3500040709008802226</p>
                                                    <p>Beneficiary Bank: 中国工商银行股份有限公司哈尔滨宣桥支行</p>
                                                    <br />
                                                    <p className="font-bold">FROM OUTSIDE MAINLAND CHINA</p>
                                                    <p>Account Name: HARBIN ENGINEERING UNIVERSITY</p>
                                                    <p>Account Number: 3500040709008802226</p>
                                                    <p>Beneficiary Bank: INDUSTRIAL AND COMMERCIAL BANK OF CHINA HARBIN CITY BRANCH</p>
                                                    <p>Address of Beneficiary Bank: No.318, East Dazhi Street, Harbin, China</p>
                                                    <p>SWIFT CODE: ICBKCNBJHLJ</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex justify-end gap-2 items-start mt-2">
                                            <div className="relative">
                                                <input
                                                    type="file"
                                                    onChange={(e) => handleFileChange(e, 'paymentCertificate')}
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                                                    disabled={uploadingStatus.paymentCertificate}
                                                />
                                                <button type="button" className="px-4 py-2 bg-[#3B82F6] text-white text-xs font-bold rounded shadow-sm hover:bg-blue-600 transition-colors flex items-center gap-2 disabled:opacity-50">
                                                    {uploadingStatus.paymentCertificate ? <Loader2 size={14} className="animate-spin" /> : null}
                                                    {uploadingStatus.paymentCertificate ? 'Uploading...' : 'Choose File 上传'}
                                                </button>
                                            </div>
                                        </div>
                                        {formData.documents.paymentCertificate && (
                                            <div className="md:col-span-3 text-right">
                                                <span className="text-xs text-emerald-600 font-bold flex items-center justify-end gap-1">
                                                    <Check className="w-3 h-3" /> {typeof formData.documents.paymentCertificate === 'string' ? 'File Uploaded' : `Selected: ${formData.documents.paymentCertificate.name}`}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Footer Actions for Tab 3 */}
                                <div className="flex items-center justify-end gap-4 w-full pt-10 border-t border-slate-200">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setActiveMainTab(prev => prev - 1)
                                            window.scrollTo({ top: 0, behavior: 'smooth' })
                                        }}
                                        className="px-6 py-2.5 border border-sky-500 text-sky-500 font-medium rounded-md hover:bg-sky-50 transition-colors"
                                    >
                                        返回 Back
                                    </button>

                                    <button
                                        type="button"
                                        onClick={async () => {
                                            await handleSaveDraft()
                                            if (activeMainTab < 5) {
                                                setActiveMainTab(prev => prev + 1)
                                                window.scrollTo({ top: 0, behavior: 'smooth' })
                                            }
                                        }}
                                        disabled={saving}
                                        className="px-6 py-2.5 bg-[#1e40af] text-white font-medium rounded-md hover:bg-blue-800 transition-colors shadow-sm disabled:opacity-50"
                                    >
                                        {saving ? 'Saving...' : '保存并继续 Save and Continue'}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => {
                                            setActiveMainTab(prev => prev + 1)
                                            window.scrollTo({ top: 0, behavior: 'smooth' })
                                        }}
                                        className="px-6 py-2.5 border border-sky-500 text-sky-500 font-medium rounded-md hover:bg-sky-50 transition-colors"
                                    >
                                        下一步 Next
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* ================= TAB 4: MORE INFO ================= */}
                        {activeMainTab === 4 && (
                            <>
                                <div className="space-y-8 animate-slideUp">
                                    <div>
                                        <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-sky-600 to-indigo-700">
                                            补充信息 More Information
                                        </h2>
                                        <p className="text-slate-500 mt-2">
                                            Please provide additional details to support your application.
                                        </p>
                                    </div>

                                    {/* 1. Applicant's Video */}
                                    <div id="video" className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                                        {/* Custom Header with Blue curve and Diamond */}
                                        <div className="relative bg-white pt-4 px-4 pb-2">
                                            <div className="flex items-center gap-2 bg-[#4DD0E1] text-white px-4 py-2 rounded-r-full w-fit shadow-sm text-sm font-bold">
                                                <div className="rotate-45 w-2 h-2 bg-white"></div>
                                                申请人视频 Applicant's Video
                                            </div>
                                        </div>

                                        <div className="p-6 space-y-6">
                                            <div>
                                                <h4 className="text-[#4DD0E1] font-bold text-sm mb-3">上传材料 UPLOAD DOCUMENTS</h4>
                                                <div className="bg-slate-100 p-4 rounded text-xs text-slate-600 font-medium">
                                                    The uploaded file type needs to be *.mp4, *.rmvb,*.avi, *.mov, *.mkv, *.wmv Maximum video size 50M
                                                </div>
                                            </div>

                                            {/* Video Upload Row */}
                                            <div className="border border-slate-200 rounded-sm">
                                                <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-slate-200">
                                                    {/* Label */}
                                                    <div className="p-4 bg-slate-50 md:w-1/3 flex items-center">
                                                        <span className="text-sky-500 font-bold text-xs">自我介绍视频 Video of Self-introduction</span>
                                                    </div>

                                                    {/* Actions */}
                                                    <div className="p-4 md:w-2/3 bg-slate-50 flex items-center justify-end gap-2">
                                                        <button type="button" className="px-4 py-2 bg-[#EF4444] text-white text-xs font-bold rounded shadow-sm hover:bg-red-600 transition-colors">
                                                            Scan To Upload 扫码上传
                                                        </button>

                                                        <div className="relative">
                                                            <input
                                                                type="file"
                                                                accept="video/*" /* Note: specific extensions can be handled in handler or accept attribute */
                                                                onChange={handleVideoUpload}
                                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                            />
                                                            <button type="button" className="px-4 py-2 bg-[#3B82F6] text-white text-xs font-bold rounded shadow-sm hover:bg-blue-600 transition-colors">
                                                                Choose File 上传
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                                {/* File Status - shown below or inside */}
                                                {uploadingStatus['video'] && (
                                                    <div className="bg-sky-50 px-4 py-2 border-t border-slate-100 flex justify-end">
                                                        <span className="text-xs text-sky-600 font-bold flex items-center gap-2">
                                                            <div className="w-3 h-3 border-2 border-sky-600 border-t-transparent rounded-full animate-spin"></div>
                                                            Uploading video...
                                                        </span>
                                                    </div>
                                                )}
                                                {!uploadingStatus['video'] && formData.moreInfo.video && (
                                                    <div className="bg-emerald-50 px-4 py-2 border-t border-slate-100 flex justify-end">
                                                        <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                                                            <Check className="w-3 h-3" /> {typeof formData.moreInfo.video === 'string' ? 'Video Uploaded ✓' : `Selected: ${formData.moreInfo.video.name}`}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* 2. Nationality Background Declaration */}
                                    <div id="nationality" className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                                        {/* Custom Header */}
                                        <div className="relative bg-white pt-4 px-4 pb-2">
                                            <div className="flex items-center gap-2 bg-[#4DD0E1] text-white px-4 py-2 rounded-r-full w-fit shadow-sm text-sm font-bold">
                                                <div className="rotate-45 w-2 h-2 bg-white"></div>
                                                国籍背景申报 Nationality Background Declaration
                                            </div>
                                        </div>

                                        <div className="p-6 space-y-6">
                                            {/* Instruction Box */}
                                            <div className="bg-slate-100 p-6 rounded-md text-xs text-slate-700 leading-relaxed font-medium">
                                                <p className="mb-2">
                                                    移民指申请人原为中国公民(含港澳台地区),后移民到外国并取得外国国籍。请申请者根据个人情况勾选以下信息。如符合上述情况请在勾选后认真填写后续申报信息。否则将影响后期录取。
                                                </p>
                                                <p>
                                                    Immigration refers to the applicant with a Chinese citizen (including Hong Kong, Macao and Taiwan), and immigrated to a foreign country and obtained foreign status. If you meet the above conditions, please provide the related information.
                                                </p>
                                            </div>

                                            {/* Question 1: Immigrant Status */}
                                            <div className="space-y-3">
                                                <label className="text-sky-500 font-bold text-sm block">
                                                    申请者是否为移民 Are you an immigrant? <span className="text-red-500">*</span>
                                                </label>
                                                <div className="flex items-center gap-8 pl-2">
                                                    <label className="flex items-center gap-2 cursor-pointer">
                                                        <input
                                                            type="radio"
                                                            name="isImmigrant"
                                                            value="Yes"
                                                            checked={formData.moreInfo.isImmigrant === 'Yes'}
                                                            onChange={handleMoreInfoChange}
                                                            className="w-4 h-4 text-sky-500 focus:ring-sky-500 border-slate-300"
                                                        />
                                                        <span className="text-sm font-bold text-blue-700">是Yes</span>
                                                    </label>
                                                    <label className="flex items-center gap-2 cursor-pointer">
                                                        <input
                                                            type="radio"
                                                            name="isImmigrant"
                                                            value="No"
                                                            checked={formData.moreInfo.isImmigrant === 'No'}
                                                            onChange={handleMoreInfoChange}
                                                            className="w-4 h-4 text-sky-500 focus:ring-sky-500 border-slate-300"
                                                        />
                                                        <span className="text-sm font-bold text-blue-700">否No</span>
                                                    </label>
                                                </div>
                                            </div>

                                            {/* Question 2: Parents Chinese Citizen Status */}
                                            <div className="space-y-3">
                                                <label className="text-sky-500 font-bold text-sm block">
                                                    父母双方或一方是否为中国公民 Whether one or both parents are Chinese citizen? <span className="text-red-500">*</span>
                                                </label>
                                                <div className="flex items-center gap-8 pl-2">
                                                    <label className="flex items-center gap-2 cursor-pointer">
                                                        <input
                                                            type="radio"
                                                            name="hasChineseParent"
                                                            value="Yes"
                                                            checked={formData.moreInfo.hasChineseParent === 'Yes'}
                                                            onChange={handleMoreInfoChange}
                                                            className="w-4 h-4 text-sky-500 focus:ring-sky-500 border-slate-300"
                                                        />
                                                        <span className="text-sm font-bold text-blue-700">是Yes</span>
                                                    </label>
                                                    <label className="flex items-center gap-2 cursor-pointer">
                                                        <input
                                                            type="radio"
                                                            name="hasChineseParent"
                                                            value="No"
                                                            checked={formData.moreInfo.hasChineseParent === 'No'}
                                                            onChange={handleMoreInfoChange}
                                                            className="w-4 h-4 text-sky-500 focus:ring-sky-500 border-slate-300"
                                                        />
                                                        <span className="text-sm font-bold text-blue-700">否No</span>
                                                    </label>
                                                </div>
                                            </div>

                                            {/* Question 3: Original Country */}
                                            <div className="space-y-2">
                                                <label className="text-sky-500 font-bold text-sm block">
                                                    原来自国家或地区 Original Country or Region
                                                </label>
                                                <select
                                                    name="originalCountry"
                                                    value={formData.moreInfo.originalCountry}
                                                    onChange={handleMoreInfoChange}
                                                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded text-sm text-slate-600 focus:ring-2 focus:ring-sky-500 outline-none"
                                                >
                                                    <option value="">请选择 Please Choose</option>
                                                    {COUNTRIES.map(c => (
                                                        <option key={c.code} value={c.name}>{c.name}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            {/* Question 4: Citizenship Date */}
                                            <div className="space-y-2">
                                                <label className="text-sky-500 font-bold text-sm block">
                                                    何时取得当前国籍 When did you get the current citizenship?
                                                </label>
                                                <input
                                                    type="date"
                                                    name="currentCitizenshipDate"
                                                    value={formData.moreInfo.currentCitizenshipDate}
                                                    onChange={handleMoreInfoChange}
                                                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded text-sm text-slate-600 focus:ring-2 focus:ring-sky-500 outline-none placeholder:text-slate-300"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* 3. Award Information */}
                                    <div id="awards" className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                                        {/* Custom Header */}
                                        <div className="relative bg-white pt-4 px-4 pb-2">
                                            <div className="flex items-center gap-2 bg-[#4DD0E1] text-white px-4 py-2 rounded-r-full w-fit shadow-sm text-sm font-bold">
                                                <div className="rotate-45 w-2 h-2 bg-white"></div>
                                                奖励信息 Award Information
                                            </div>
                                        </div>

                                        <div className="p-6">
                                            {/* Table Header Row (Always visible) */}
                                            <div className="bg-[#F8FAFC] border border-slate-200 flex text-center text-xs font-bold text-slate-700">
                                                <div className="flex-1 p-3 border-r border-slate-200 flex flex-col justify-center">
                                                    <span>奖励名称</span>
                                                    <span className="text-[10px] text-slate-500">Name of award</span>
                                                </div>
                                                <div className="flex-1 p-3 border-r border-slate-200 flex flex-col justify-center">
                                                    <span>奖励性质</span>
                                                    <span className="text-[10px] text-slate-500">Reward type</span>
                                                </div>
                                                <div className="flex-1 p-3 border-r border-slate-200 flex flex-col justify-center">
                                                    <span>奖励等级</span>
                                                    <span className="text-[10px] text-slate-500">Award Level</span>
                                                </div>
                                                <div className="flex-1 p-3 border-r border-slate-200 flex flex-col justify-center">
                                                    <span>奖励领域</span>
                                                    <span className="text-[10px] text-slate-500">Reward areas</span>
                                                </div>
                                                <div className="flex-1 p-3 border-r border-slate-200 flex flex-col justify-center">
                                                    <span>奖励时间</span>
                                                    <span className="text-[10px] text-slate-500">Reward time</span>
                                                </div>
                                                <div className="w-24 p-2 flex items-center justify-center bg-white">
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowAwardForm(true)}
                                                        className="text-[#4DD0E1] font-bold hover:text-sky-600 transition-colors"
                                                    >
                                                        Add 添加
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Added Awards List */}
                                            <div className="border-x border-b border-slate-200 divide-y divide-slate-100">
                                                {formData.moreInfo.awards.map((award, idx) => (
                                                    <div key={award.id || idx} className="flex text-center text-xs text-slate-600 hover:bg-slate-50 transition-colors">
                                                        <div className="flex-1 p-3 border-r border-slate-100 flex items-center justify-center break-words">{award.name}</div>
                                                        <div className="flex-1 p-3 border-r border-slate-100 flex items-center justify-center">{award.type}</div>
                                                        <div className="flex-1 p-3 border-r border-slate-100 flex items-center justify-center">{award.level}</div>
                                                        <div className="flex-1 p-3 border-r border-slate-100 flex items-center justify-center">{award.area}</div>
                                                        <div className="flex-1 p-3 border-r border-slate-100 flex items-center justify-center">{award.date}</div>
                                                        <div className="w-24 p-3 flex items-center justify-center">
                                                            <button
                                                                type="button"
                                                                onClick={() => removeAward(award.id)}
                                                                className="text-rose-500 hover:text-rose-700"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                                {formData.moreInfo.awards.length === 0 && !showAwardForm && (
                                                    <div className="p-4 text-center text-slate-400 text-xs">
                                                        No awards added. Click "Add 添加" to enter award details.
                                                    </div>
                                                )}
                                            </div>

                                            {/* Add Award Form (Expanded) */}
                                            {showAwardForm && (
                                                <div className="mt-6 animate-fadeIn">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                                        {/* Row 1 */}
                                                        <div className="space-y-2">
                                                            <label className="text-sky-400 font-bold text-sm block">
                                                                奖励名称 Award name<span className="text-red-500">*</span>
                                                            </label>
                                                            <input
                                                                type="text"
                                                                name="name"
                                                                value={currentAward.name}
                                                                onChange={handleAwardInputChange}
                                                                className="w-full px-4 py-2 bg-white border border-red-300 rounded text-sm outline-none focus:ring-2 focus:ring-sky-500 placeholder:text-slate-400"
                                                                placeholder="Award name"
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="text-sky-400 font-bold text-sm block">
                                                                奖励性质 Award type<span className="text-red-500">*</span>
                                                            </label>
                                                            <select
                                                                name="type"
                                                                value={currentAward.type}
                                                                onChange={handleAwardInputChange}
                                                                className="w-full px-4 py-2 bg-white border border-red-300 rounded text-sm text-blue-600 font-bold outline-none focus:ring-2 focus:ring-sky-500"
                                                            >
                                                                <option value="">请选择 Please Choose</option>
                                                                {AWARD_TYPES.map(t => (
                                                                    <option key={t.value} value={t.value}>{t.name}</option>
                                                                ))}
                                                            </select>
                                                        </div>

                                                        {/* Row 2 */}
                                                        <div className="space-y-2">
                                                            <label className="text-sky-400 font-bold text-sm block">
                                                                奖励等级 Award level<span className="text-red-500">*</span>
                                                            </label>
                                                            <select
                                                                name="level"
                                                                value={currentAward.level}
                                                                onChange={handleAwardInputChange}
                                                                className="w-full px-4 py-2 bg-white border border-red-300 rounded text-sm text-blue-600 font-bold outline-none focus:ring-2 focus:ring-sky-500"
                                                            >
                                                                <option value="">请选择 Please Choose</option>
                                                                {AWARD_LEVELS.map(l => (
                                                                    <option key={l.value} value={l.value}>{l.name}</option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="text-sky-400 font-bold text-sm block">
                                                                奖励领域 Award field<span className="text-red-500">*</span>
                                                            </label>
                                                            <select
                                                                name="area"
                                                                value={currentAward.area}
                                                                onChange={handleAwardInputChange}
                                                                className="w-full px-4 py-2 bg-white border border-red-300 rounded text-sm text-blue-600 font-bold outline-none focus:ring-2 focus:ring-sky-500"
                                                            >
                                                                <option value="">请选择 Please Choose</option>
                                                                {AWARD_AREAS.map(a => (
                                                                    <option key={a.value} value={a.value}>{a.name}</option>
                                                                ))}
                                                            </select>
                                                        </div>

                                                        {/* Row 3 */}
                                                        <div className="md:col-span-2 space-y-2">
                                                            <label className="text-sky-400 font-bold text-sm block">
                                                                奖励时间 Award time: <span className="text-red-500">*</span>
                                                            </label>
                                                            <input
                                                                type="date"
                                                                name="date"
                                                                value={currentAward.date}
                                                                onChange={handleAwardInputChange}
                                                                className="w-full px-4 py-2 bg-white border border-slate-200 rounded text-sm outline-none focus:ring-2 focus:ring-sky-500"
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="flex justify-center gap-4 mt-8">
                                                        <button
                                                            type="button"
                                                            onClick={handleAddAward}
                                                            className="px-8 py-2 bg-[#5B9CF6] text-white font-medium rounded hover:bg-blue-600 transition-colors shadow-sm"
                                                        >
                                                            保存 Save
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowAwardForm(false)}
                                                            className="px-8 py-2 bg-white border border-[#5B9CF6] text-[#5B9CF6] font-medium rounded hover:bg-slate-50 transition-colors"
                                                        >
                                                            关闭 Close
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* 4. Guardian Information */}
                                    <div id="guardian" className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                                        {/* Custom Header */}
                                        <div className="relative bg-white pt-4 px-4 pb-2">
                                            <div className="flex items-center gap-2 bg-[#4DD0E1] text-white px-4 py-2 rounded-r-full w-fit shadow-sm text-sm font-bold">
                                                <div className="rotate-45 w-2 h-2 bg-white"></div>
                                                监护人信息（仅针对18岁以下学生） Guardian Information (for applicants age below 18 years old)
                                            </div>
                                        </div>

                                        <div className="p-6">
                                            {/* Table Header Row */}
                                            <div className="bg-[#F8FAFC] border border-slate-200 flex text-center text-xs font-bold text-slate-700">
                                                <div className="flex-1 p-3 border-r border-slate-200 flex flex-col justify-center">
                                                    <span>姓名</span>
                                                    <span className="text-[10px] text-slate-500">Name</span>
                                                </div>
                                                <div className="flex-1 p-3 border-r border-slate-200 flex flex-col justify-center">
                                                    <span>关系</span>
                                                    <span className="text-[10px] text-slate-500">Relationship</span>
                                                </div>
                                                <div className="flex-1 p-3 border-r border-slate-200 flex flex-col justify-center">
                                                    <span>单位名称</span>
                                                    <span className="text-[10px] text-slate-500">Work Place</span>
                                                </div>
                                                <div className="flex-1 p-3 border-r border-slate-200 flex flex-col justify-center">
                                                    <span>职业</span>
                                                    <span className="text-[10px] text-slate-500">Occupation</span>
                                                </div>
                                                <div className="flex-1 p-3 border-r border-slate-200 flex flex-col justify-center">
                                                    <span>联系电话</span>
                                                    <span className="text-[10px] text-slate-500">Phone/Mobile</span>
                                                </div>
                                                <div className="flex-1 p-3 border-r border-slate-200 flex flex-col justify-center">
                                                    <span>联系邮箱</span>
                                                    <span className="text-[10px] text-slate-500">Email</span>
                                                </div>
                                                <div className="w-24 p-2 flex items-center justify-center bg-white">
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowGuardianForm(true)}
                                                        className="text-[#4DD0E1] font-bold hover:text-sky-600 transition-colors"
                                                    >
                                                        Add 添加
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Added Guardians List */}
                                            <div className="border-x border-b border-slate-200 divide-y divide-slate-100">
                                                {formData.moreInfo.guardians && formData.moreInfo.guardians.map((guardian, idx) => (
                                                    <div key={guardian.id || idx} className="flex text-center text-xs text-slate-600 hover:bg-slate-50 transition-colors">
                                                        <div className="flex-1 p-3 border-r border-slate-100 flex items-center justify-center break-words">{guardian.name}</div>
                                                        <div className="flex-1 p-3 border-r border-slate-100 flex items-center justify-center">{guardian.relationship}</div>
                                                        <div className="flex-1 p-3 border-r border-slate-100 flex items-center justify-center">{guardian.workPlace}</div>
                                                        <div className="flex-1 p-3 border-r border-slate-100 flex items-center justify-center">{guardian.occupation}</div>
                                                        <div className="flex-1 p-3 border-r border-slate-100 flex items-center justify-center">{guardian.phone}</div>
                                                        <div className="flex-1 p-3 border-r border-slate-100 flex items-center justify-center">{guardian.email}</div>
                                                        <div className="w-24 p-3 flex items-center justify-center">
                                                            <button
                                                                type="button"
                                                                onClick={() => removeGuardian(guardian.id)}
                                                                className="text-rose-500 hover:text-rose-700"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                                {(!formData.moreInfo.guardians || formData.moreInfo.guardians.length === 0) && !showGuardianForm && (
                                                    <div className="p-4 text-center text-slate-400 text-xs">
                                                        No guardian information added. Click "Add 添加" if applicable (under 18).
                                                    </div>
                                                )}
                                            </div>

                                            {/* Add Guardian Form */}
                                            {showGuardianForm && (
                                                <div className="mt-6 animate-fadeIn">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                                        {/* Row 1 */}
                                                        <div className="space-y-2">
                                                            <label className="text-sky-400 font-bold text-sm block">
                                                                姓名 Name<span className="text-red-500">*</span>
                                                            </label>
                                                            <input
                                                                type="text"
                                                                name="name"
                                                                value={currentGuardian.name}
                                                                onChange={handleGuardianInputChange}
                                                                className="w-full px-4 py-2 bg-white border border-red-300 rounded text-sm outline-none focus:ring-2 focus:ring-sky-500 placeholder:text-slate-400"
                                                                placeholder="Name"
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="text-sky-400 font-bold text-sm block">
                                                                关系 Relationship with the student<span className="text-red-500">*</span>
                                                            </label>
                                                            <select
                                                                name="relationship"
                                                                value={currentGuardian.relationship}
                                                                onChange={handleGuardianInputChange}
                                                                className="w-full px-4 py-2 bg-white border border-red-300 rounded text-sm text-blue-600 font-bold outline-none focus:ring-2 focus:ring-sky-500"
                                                            >
                                                                <option value="">无 None</option>
                                                                {RELATIONSHIPS.map(r => (
                                                                    <option key={r.value} value={r.value}>{r.name}</option>
                                                                ))}
                                                            </select>
                                                        </div>

                                                        {/* Row 2 */}
                                                        <div className="space-y-2">
                                                            <label className="text-sky-400 font-bold text-sm block">
                                                                单位名称 Work Place<span className="text-red-500">*</span>
                                                            </label>
                                                            <input
                                                                type="text"
                                                                name="workPlace"
                                                                value={currentGuardian.workPlace}
                                                                onChange={handleGuardianInputChange}
                                                                className="w-full px-4 py-2 bg-white border border-slate-200 rounded text-sm outline-none focus:ring-2 focus:ring-sky-500 placeholder:text-slate-400"
                                                                placeholder="Name of Institute/Employer"
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="text-sky-400 font-bold text-sm block">
                                                                行业类型 Industry Type<span className="text-red-500">*</span>
                                                            </label>
                                                            <select
                                                                name="industryType"
                                                                value={currentGuardian.industryType}
                                                                onChange={handleGuardianInputChange}
                                                                className="w-full px-4 py-2 bg-white border border-red-300 rounded text-sm text-blue-600 font-bold outline-none focus:ring-2 focus:ring-sky-500"
                                                            >
                                                                <option value="">请选择 Please Choose</option>
                                                                {INDUSTRY_TYPES.map(t => (
                                                                    <option key={t.value} value={t.value}>{t.name}</option>
                                                                ))}
                                                            </select>
                                                        </div>

                                                        {/* Row 3 */}
                                                        <div className="space-y-2">
                                                            <label className="text-sky-400 font-bold text-sm block">
                                                                职业 Occupation<span className="text-red-500">*</span>
                                                            </label>
                                                            <select
                                                                name="occupation"
                                                                value={currentGuardian.occupation}
                                                                onChange={handleGuardianInputChange}
                                                                className="w-full px-4 py-2 bg-white border border-red-300 rounded text-sm text-blue-600 font-bold outline-none focus:ring-2 focus:ring-sky-500"
                                                            >
                                                                <option value="">请选择 Please Choose</option>
                                                                {OCCUPATIONS.map(o => (
                                                                    <option key={o.value} value={o.value}>{o.name}</option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="text-sky-400 font-bold text-sm block">
                                                                电话 Phone or Mobile<span className="text-red-500">*</span>
                                                            </label>
                                                            <input
                                                                type="tel"
                                                                name="phone"
                                                                value={currentGuardian.phone}
                                                                onChange={handleGuardianInputChange}
                                                                className="w-full px-4 py-2 bg-white border border-slate-200 rounded text-sm outline-none focus:ring-2 focus:ring-sky-500 placeholder:text-slate-400"
                                                                placeholder="Contact Tel"
                                                            />
                                                        </div>

                                                        {/* Row 4 */}
                                                        <div className="md:col-span-2 space-y-2">
                                                            <label className="text-sky-400 font-bold text-sm block">
                                                                邮箱 Email: <span className="text-red-500">*</span>
                                                            </label>
                                                            <input
                                                                type="email"
                                                                name="email"
                                                                value={currentGuardian.email}
                                                                onChange={handleGuardianInputChange}
                                                                className="w-full px-4 py-2 bg-white border border-red-300 rounded text-sm outline-none focus:ring-2 focus:ring-sky-500"
                                                                placeholder="Contact Email"
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="flex justify-center gap-4 mt-8">
                                                        <button
                                                            type="button"
                                                            onClick={handleAddGuardian}
                                                            className="px-8 py-2 bg-[#5B9CF6] text-white font-medium rounded hover:bg-blue-600 transition-colors shadow-sm"
                                                        >
                                                            保存 Save
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowGuardianForm(false)}
                                                            className="px-8 py-2 bg-white border border-[#5B9CF6] text-[#5B9CF6] font-medium rounded hover:bg-slate-50 transition-colors"
                                                        >
                                                            关闭 Close
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* 5. Other Information */}
                                    <div id="otherInfo" className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                                        {/* Blue Header */}
                                        <div className="px-6 py-4 bg-[#4DD0E1] flex items-center gap-3">
                                            <div className="w-6 h-6 bg-white transform rotate-45 flex items-center justify-center shadow-sm">
                                                <div className="w-3 h-3 bg-[#4DD0E1]"></div>
                                            </div>
                                            <h3 className="text-white font-bold text-lg tracking-wide">
                                                其它信息 Other Information
                                            </h3>
                                        </div>

                                        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                                            {/* CSC/CIS NO */}
                                            <div className="space-y-3">
                                                <label className="text-sky-400 font-bold text-sm block flex items-center gap-2">
                                                    CSC/CIS编号 CSC/CIS NO
                                                    <div className="w-4 h-4 rounded-full border border-sky-400 text-sky-400 flex items-center justify-center text-xs cursor-help" title="Enter if applicable">?</div>
                                                </label>
                                                <input
                                                    type="text"
                                                    name="cscNo"
                                                    value={formData.moreInfo.otherInfo.cscNo}
                                                    onChange={handleMoreInfoChange}
                                                    className="w-full px-4 py-2 border border-slate-200 rounded text-sm outline-none focus:ring-2 focus:ring-sky-500 hover:border-sky-300 transition-colors"
                                                />
                                            </div>

                                            {/* Hobbies */}
                                            <div className="space-y-3">
                                                <label className="text-sky-400 font-bold text-sm block">
                                                    特长爱好 Hobbies
                                                </label>
                                                <input
                                                    type="text"
                                                    name="hobbies"
                                                    value={formData.moreInfo.otherInfo.hobbies}
                                                    onChange={handleMoreInfoChange}
                                                    placeholder="HOBBIES"
                                                    className="w-full px-4 py-2 border border-slate-200 rounded text-sm outline-none focus:ring-2 focus:ring-sky-500 hover:border-sky-300 transition-colors placeholder:text-slate-300 uppercase"
                                                />
                                            </div>

                                            {/* Smoking */}
                                            <div className="space-y-3">
                                                <label className="text-sky-400 font-bold text-sm block">
                                                    是否吸烟 Smoking
                                                </label>
                                                <div className="relative">
                                                    <select
                                                        name="isSmoking"
                                                        value={formData.moreInfo.otherInfo.isSmoking}
                                                        onChange={handleMoreInfoChange}
                                                        className="w-full px-4 py-2 bg-white border border-slate-200 rounded text-sm text-blue-600 font-bold outline-none focus:ring-2 focus:ring-sky-500 appearance-none hover:border-sky-300"
                                                    >
                                                        <option value="">请选择 Please Select</option>
                                                        <option value="Yes">否 No</option>
                                                        <option value="No">是 Yes</option>
                                                    </select>
                                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-600 pointer-events-none">
                                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Diseases */}
                                            <div className="space-y-3">
                                                <label className="text-sky-400 font-bold text-sm block">
                                                    是否有特殊疾病 Are there any particular diseases?
                                                </label>
                                                <div className="relative">
                                                    <select
                                                        name="hasDisease"
                                                        value={formData.moreInfo.otherInfo.hasDisease}
                                                        onChange={handleMoreInfoChange}
                                                        className="w-full px-4 py-2 bg-white border border-slate-200 rounded text-sm text-blue-600 font-bold outline-none focus:ring-2 focus:ring-sky-500 appearance-none hover:border-sky-300"
                                                    >
                                                        <option value="">请选择 Please Select</option>
                                                        <option value="Yes">否 No</option>
                                                        <option value="No">是 Yes</option>
                                                    </select>
                                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-600 pointer-events-none">
                                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                                                    </div>
                                                </div>
                                            </div>
                                            {/* Non-criminal Record */}
                                            <div className="space-y-3">
                                                <label className="text-sky-400 font-bold text-sm block">
                                                    是否有无犯罪证明 Do you have Certificate of Non-criminal Record
                                                </label>
                                                <div className="relative">
                                                    <select
                                                        name="hasCriminalRecord"
                                                        value={formData.moreInfo.otherInfo.hasCriminalRecord}
                                                        onChange={handleMoreInfoChange}
                                                        className="w-full px-4 py-2 bg-white border border-slate-200 rounded text-sm text-blue-600 font-bold outline-none focus:ring-2 focus:ring-sky-500 appearance-none hover:border-sky-300"
                                                    >
                                                        <option value="">请选择 Please Select</option>
                                                        <option value="Yes">否 No</option>
                                                        <option value="No">是 Yes</option>
                                                    </select>
                                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-600 pointer-events-none">
                                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Criminal History */}
                                            <div className="space-y-3">
                                                <label className="text-sky-400 font-bold text-sm block">
                                                    是否曾有过犯罪史 Have you ever committed a crime?
                                                </label>
                                                <div className="relative">
                                                    <select
                                                        name="hasCriminalHistory"
                                                        value={formData.moreInfo.otherInfo.hasCriminalHistory}
                                                        onChange={handleMoreInfoChange}
                                                        className="w-full px-4 py-2 bg-white border border-slate-200 rounded text-sm text-blue-600 font-bold outline-none focus:ring-2 focus:ring-sky-500 appearance-none hover:border-sky-300"
                                                    >
                                                        <option value="">请选择 Please Select</option>
                                                        <option value="Yes">否 No</option>
                                                        <option value="No">是 Yes</option>
                                                    </select>
                                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-600 pointer-events-none">
                                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Physical Exam */}
                                            <div className="space-y-3">
                                                <label className="text-sky-400 font-bold text-sm block">
                                                    是否有体检表 Do you have physical examination form?
                                                </label>
                                                <div className="relative">
                                                    <select
                                                        name="hasPhysicalExam"
                                                        value={formData.moreInfo.otherInfo.hasPhysicalExam}
                                                        onChange={handleMoreInfoChange}
                                                        className="w-full px-4 py-2 bg-white border border-slate-200 rounded text-sm text-blue-600 font-bold outline-none focus:ring-2 focus:ring-sky-500 appearance-none hover:border-sky-300"
                                                    >
                                                        <option value="">请选择 Please Select</option>
                                                        <option value="Yes">否 No</option>
                                                        <option value="No">是 Yes</option>
                                                    </select>
                                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-600 pointer-events-none">
                                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>


                                    {/* 6. Application Note */}
                                    <div id="applicationNote" className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mt-8">
                                        {/* Blue Header */}
                                        <div className="px-6 py-4 bg-[#4DD0E1] flex items-center gap-3">
                                            <div className="w-6 h-6 bg-white transform rotate-45 flex items-center justify-center shadow-sm">
                                                <div className="w-3 h-3 bg-[#4DD0E1]"></div>
                                            </div>
                                            <h3 className="text-white font-bold text-lg tracking-wide">
                                                申请备注 Application Note
                                            </h3>
                                        </div>

                                        <div className="p-6">
                                            <textarea
                                                name="applicationNote"
                                                value={formData.moreInfo.applicationNote}
                                                onChange={handleMoreInfoChange}
                                                className="w-full h-24 px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all resize-none"
                                            />
                                        </div>
                                    </div>

                                    {/* Footer Actions for Tab 4 */}
                                    <div className="flex items-center justify-end gap-4 w-full pt-10 border-t border-slate-200">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setActiveMainTab(prev => prev - 1)
                                                window.scrollTo({ top: 0, behavior: 'smooth' })
                                            }}
                                            className="px-6 py-2.5 border border-sky-500 text-sky-500 font-medium rounded-md hover:bg-sky-50 transition-colors"
                                        >
                                            返回 Back
                                        </button>

                                        <button
                                            type="button"
                                            onClick={async () => {
                                                await handleSaveDraft()
                                                if (activeMainTab < 5) {
                                                    setActiveMainTab(prev => prev + 1)
                                                    window.scrollTo({ top: 0, behavior: 'smooth' })
                                                }
                                            }}
                                            disabled={saving}
                                            className="px-6 py-2.5 bg-[#1e40af] text-white font-medium rounded-md hover:bg-blue-800 transition-colors shadow-sm disabled:opacity-50"
                                        >
                                            {saving ? 'Saving...' : '保存并继续 Save and Continue'}
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => {
                                                setActiveMainTab(prev => prev + 1)
                                                window.scrollTo({ top: 0, behavior: 'smooth' })
                                            }}
                                            className="px-6 py-2.5 border border-sky-500 text-sky-500 font-medium rounded-md hover:bg-sky-50 transition-colors"
                                        >
                                            下一步 Next
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* ================= TAB 5: PREVIEW & SUBMIT ================= */}
                        {activeMainTab > 4 && (
                            <div className="space-y-8 animate-fadeIn pb-20 max-w-5xl mx-auto">
                                <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-8 text-center">
                                    <div className="w-16 h-16 bg-sky-100 rounded-full flex items-center justify-center mx-auto mb-4 text-sky-500">
                                        <Info size={32} />
                                    </div>
                                    <h2 className="text-2xl font-bold text-slate-800 mb-2">预览及提交 Preview & Submit</h2>
                                    <p className="text-slate-500 max-w-lg mx-auto">
                                        请核对您的申请信息。提交后将无法修改。
                                        Please review your application details. Once submitted, you will not be able to make changes.
                                    </p>
                                </div>

                                {/* 1. PROFILE */}
                                <ReviewCard title="1. 个人基本信息 Personal Information" color="#4DD0E1">
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-2">
                                        <div className="col-span-full flex flex-col items-center mb-8 border-b border-slate-100 pb-8">
                                            {formData.photo ? (
                                                <div className="w-32 h-40 border-4 border-white rounded-xl overflow-hidden shadow-md ring-1 ring-slate-100">
                                                    <img
                                                        src={typeof formData.photo === 'string' ? formData.photo : URL.createObjectURL(formData.photo)}
                                                        alt="Photo"
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="w-32 h-40 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center text-slate-300">照片 Photo</div>
                                            )}
                                        </div>
                                        <DetailItem label="护照姓名 Passport Name" value={`${formData.passportFamilyName} ${formData.givenName}`.trim()} uppercase />
                                        <DetailItem label="护照姓 Passport Family Name" value={formData.passportFamilyName} />
                                        <DetailItem label="护照名 Given Name" value={formData.givenName} />
                                        <DetailItem label="中文姓名 Chinese Name" value={formData.chineseName} />
                                        <DetailItem label="性别 Gender" value={formData.gender} />
                                        <DetailItem label="国籍 Nationality" value={formData.nationality} />
                                        <DetailItem label="出生日期 Date of Birth" value={formData.dob} />
                                        <DetailItem label="出生国家或地区 Country/District of Birth" value={formData.birthCountry} />
                                        <DetailItem label="我在中国 Whether in China now?" value={formData.isInChinaNow} />
                                        <DetailItem label="母语 Mother Tongue" value={formData.nativeLanguage} />
                                        <DetailItem label="婚姻状态 Marital Status" value={formData.maritalStatus} />
                                        <DetailItem label="宗教 Religion" value={formData.religion} />
                                        <DetailItem label="职业 Occupation" value={formData.occupation} />
                                        <DetailItem label="曾就职/读单位 Status/Employer" value={formData.employerOrInstitution} />
                                    </div>
                                </ReviewCard>

                                {/* 2. CORRESPONDENCE ADDRESS */}
                                <ReviewCard title="2. 通讯地址 Correspondence Address" color="#4DD0E1">
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                                        <div className="space-y-3">
                                            <h4 className="text-sm font-bold text-red-500 border-l-4 border-red-500 pl-3 mb-4">家庭地址 Home Address</h4>
                                            <DetailItem label="街道地址 Street Address" value={formData.homeDetailedAddress} tiny />
                                            <DetailItem label="省/城市 Province/City" value={formData.homeCityProvince} tiny />
                                            <DetailItem label="国家 Country" value={formData.homeCountry} tiny />
                                            <DetailItem label="邮编 Zipcode" value={formData.homeZipcode} tiny />
                                            <DetailItem label="电话/手机 Phone or Mobile" value={formData.homePhone} tiny />
                                            <DetailItem label="常用邮箱 Main Email" value={formData.homeMainEmail} tiny />
                                        </div>
                                        <div className="space-y-3">
                                            <h4 className="text-sm font-bold text-[#FF9800] border-l-4 border-[#FF9800] pl-3 mb-4">当前地址 Current Address</h4>
                                            <DetailItem label="现住址 Current Address" value={formData.currentDetailedAddress} tiny />
                                            <DetailItem label="省/城市 Province/City" value={formData.currentCityProvince} tiny />
                                            <DetailItem label="国家 Country" value={formData.currentCountry} tiny />
                                            <DetailItem label="邮编 Zipcode" value={formData.currentZipcode} tiny />
                                            <DetailItem label="电话/手机 Mobile/Phone" value={formData.currentPhone} tiny />
                                            <DetailItem label="学生邮箱 Email" value={formData.currentEmail} tiny />
                                        </div>
                                    </div>
                                </ReviewCard>

                                {/* 3. MAILING ADDRESS */}
                                <ReviewCard title="3. 通知书邮寄地址 Mailing Address for Admission Notice" color="#4DD0E1">
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-2">
                                        <DetailItem label="收件人姓名 Receiver's Name" value={formData.mailingReceiverName} />
                                        <DetailItem label="收件人手机 Phone or Mobile" value={formData.mailingPhone} />
                                        <DetailItem label="收件人省/城市 Province/City" value={formData.mailingProvinceCity} />
                                        <DetailItem label="收件人国家 Receiver's Country" value={formData.mailingCountry} />
                                        <DetailItem label="收件人地址 Receiver's Address" value={formData.mailingDetailedAddress} fullWidth />
                                        <DetailItem label="邮编 Zipcode" value={formData.mailingZipcode} />
                                    </div>
                                </ReviewCard>

                                {/* 4. PASSPORT & VISA */}
                                <ReviewCard title="4. 证照信息 Passport and Visa Information" color="#4DD0E1">
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-2">
                                        <DetailItem label="护照号 Passport No." value={formData.passportNo} uppercase />
                                        <DetailItem label="有效期 Validity Period" value={formData.passportStartDate && formData.passportExpiryDate ? `${formData.passportStartDate} ~ ${formData.passportExpiryDate}` : ''} />
                                    </div>
                                </ReviewCard>

                                {/* 5. LEARNING EXPERIENCE IN CHINA */}
                                <ReviewCard title="5. 在华学习经历 Learning Experience In China" color="#4DD0E1">
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-2">
                                        <DetailItem label="曾有学习经历? Ever studied?" value={formData.hasStudiedInChina} />
                                        {formData.hasStudiedInChina === 'Yes' && (
                                            <>
                                                <DetailItem label="院校 Institution" value={formData.chinaInstitution} />
                                                <DetailItem label="起止日期 Date From-To" value={formData.chinaStudyStartDate && formData.chinaStudyEndDate ? `${formData.chinaStudyStartDate} ~ ${formData.chinaStudyEndDate}` : ''} />
                                            </>
                                        )}
                                    </div>
                                </ReviewCard>

                                {/* 6. FINANCIAL SPONSOR */}
                                <ReviewCard title="6. 经济担保人信息 Financial Sponsor's Information" color="#4DD0E1" noPadding>
                                    <ReviewTable
                                        headers={["姓名\nName", "关系\nRelationship", "单位名称\nWork Place", "国籍\nNationality", "职业\nOccupation", "行业类型\nIndustry Type", "联系邮箱\nEmail", "联系电话\nPhone"]}
                                        rows={formData.financialSponsors.map(s => [
                                            s.name, s.relationship, s.workPlace, s.nationality, s.occupation, s.industryType, s.email, s.phone
                                        ])}
                                    />
                                </ReviewCard>

                                {/* 7. GUARANTOR */}
                                <ReviewCard title="7. 事务担保人信息 Guarantor's Information" color="#4DD0E1" noPadding>
                                    <ReviewTable
                                        headers={["姓名\nName", "关系\nRelationship", "单位名称\nWork Place", "国籍\nNationality", "职业\nOccupation", "行业类型\nIndustry Type", "联系邮箱\nEmail", "联系电话\nPhone"]}
                                        rows={formData.guarantors.map(g => [
                                            g.name, g.relationship, g.workPlace, g.nationality, g.occupation, g.industryType, g.email, g.phone
                                        ])}
                                    />
                                </ReviewCard>

                                {/* 8. EMERGENCY CONTACT */}
                                <ReviewCard title="8. 紧急联系人 Emergency Contact" color="#4DD0E1" noPadding>
                                    <ReviewTable
                                        headers={["姓名\nName", "关系\nRelationship with the student", "单位名称\nWork Place", "职业\nOccupation", "联系电话\nPhone or Mobile", "联系邮箱\nEmail"]}
                                        rows={formData.emergencyContacts.map(e => [
                                            e.name, e.relationship, e.workPlace, e.occupation, e.phone, e.email
                                        ])}
                                    />
                                </ReviewCard>

                                {/* 9. MAJOR'S INFORMATION */}
                                <ReviewCard title="9. 学习专业 Major's Information" color="#3B82F6">
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-2">
                                        <DetailItem label="所属类别 Program Category" value={formData.majorEnrollmentCategory} />
                                        <DetailItem label="专业名称 Major" value={formData.majorCourse} />
                                        <DetailItem label="授课语言 Instruction Language" value={formData.majorTeachingLanguage} />
                                        <DetailItem label="学习年限 Study Duration" value={formData.majorStudyDuration} />
                                    </div>
                                </ReviewCard>

                                {/* 10. REFEREE INFORMATION */}
                                <ReviewCard title="10. 推荐人信息 Referee Information" color="#3B82F6" noPadding>
                                    <ReviewTable
                                        headers={["姓名\nName", "与学生关系\nRelationship with the student", "单位名称\nWork Place", "职业\nOccupation", "联系电话\nPhone or Mobile", "联系邮箱\nEmail"]}
                                        rows={formData.referees.map(r => [
                                            r.name, r.relationship, r.organization, r.occupation, r.phone, r.email
                                        ])}
                                    />
                                </ReviewCard>

                                {/* 11. LANGUAGE PROFICIENCY */}
                                <ReviewCard title="11. 语言能力 Language Proficiency" color="#3B82F6">
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12">
                                        <div className="space-y-2">
                                            <h4 className="text-sm font-bold text-sky-600 mb-4 border-b border-sky-100 pb-1">英语 English Proficiency</h4>
                                            <DetailItem label="英语水平 English Proficiency" value={formData.englishProficiency} />
                                            <DetailItem label="雅思 IELTS" value={formData.ieltsScore} />
                                            <DetailItem label="托福 TOEFL" value={formData.toeflScore} />
                                            <DetailItem label="GRE成绩 GRE" value={formData.greScore} />
                                            <DetailItem label="GMAT成绩 GMAT" value={formData.gmatScore} />
                                            <DetailItem label="多邻国成绩 Duolingo" value={formData.duolingoScore} />
                                            <DetailItem label="托业成绩 TOEIC" value={formData.toeicScore} />
                                            <DetailItem label="其他证书 Other English Cert" value={formData.otherEnglishCert} />
                                        </div>
                                        <div className="space-y-2">
                                            <h4 className="text-sm font-bold text-sky-600 mb-4 border-b border-sky-100 pb-1">汉语 Chinese Proficiency</h4>
                                            <DetailItem label="汉语水平 Chinese Proficiency" value={formData.chineseProficiency} />
                                            <DetailItem label="HSK等级 HSK Level" value={formData.hskLevel} />
                                            <DetailItem label="HSK成绩 HSK Score" value={formData.hskScore} />
                                            <DetailItem label="HSKK成绩 HSKK Score" value={formData.hskkScore} />
                                            <DetailItem label="学习汉语时间 Time for Learning" value={formData.timeForLearningChinese} />
                                            <DetailItem label="汉语教师国籍 Teacher Nationality" value={formData.chineseTeacherNationality} />
                                            <DetailItem label="学习机构 Institution" value={formData.chineseLearningInstitution} />
                                            <DetailItem label="HSK证书编号 HSK No" value={formData.hskCertificateNo} />
                                        </div>
                                    </div>
                                </ReviewCard>

                                {/* 12. EDUCATION BACKGROUND */}
                                <ReviewCard title="12. 教育背景 Education History" color="#3B82F6">
                                    <div className="space-y-8">
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-2 bg-slate-50/50 p-6 rounded-xl border border-slate-100">
                                            <DetailItem label="最高学历 Highest Degree" value={formData.educationHighestDegree} />
                                            <DetailItem label="毕业院校 Highest Graduate School" value={formData.educationHighestSchool} />
                                            <DetailItem label="证书类型 Highest Cert Type" value={formData.educationHighestCertificateType} />
                                            <DetailItem label="总分/绩点 GPA/Score" value={formData.educationHighestGPA} />
                                            <DetailItem label="是否挂科 Any failures?" value={formData.educationHasFailures} />
                                        </div>
                                        <div>
                                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                                                教育经历 Chronological History
                                            </h4>
                                            <ReviewTable
                                                headers={["学历\nDegree", "学校\nSchool name", "开始时间\nYear of attendance (from)", "结束时间\nYear of attendance (to)", "联系人\nContact person"]}
                                                rows={formData.educations.map(ed => [
                                                    ed.degree, ed.school, ed.startDate, ed.endDate, ed.contactPerson
                                                ])}
                                            />
                                        </div>
                                    </div>
                                </ReviewCard>

                                {/* 13. WORK EXPERIENCE */}
                                <ReviewCard title="13. 工作经历 Work Information" color="#3B82F6">
                                    <div className="space-y-8">
                                        <ReviewTable
                                            headers={["开始时间\nYear of attendance (from)", "结束时间\nYear of attendance (to)", "单位名称\nCompany", "职业\nOccupation", "证明人\nReference", "联系电话\nPhone/Mobile", "联系邮箱\nEmail"]}
                                            rows={formData.workExperiences.map(w => [
                                                w.startDate, w.endDate, w.company, w.occupation, w.reference, w.phone, w.email
                                            ])}
                                        />
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-2 bg-slate-50/50 p-6 rounded-xl border border-slate-100">
                                            <DetailItem label="曾在中国工作? Ever worked in China?" value={formData.hasWorkedInChina} />
                                            {formData.hasWorkedInChina === 'Yes' && (
                                                <>
                                                    <DetailItem label="在华工作单位 Company in China" value={formData.chinaWorkCompany} />
                                                    <DetailItem label="在华工作期限 Working in China Duration" value={formData.chinaWorkDuration} />
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </ReviewCard>

                                {/* 14. FAMILY MEMBERS */}
                                <ReviewCard title="14. 家庭成员信息 Family Members" color="#3B82F6" noPadding>
                                    <ReviewTable
                                        headers={["姓名\nName", "关系\nRelationship", "国籍\nNationality", "单位名称\nWork Place", "职业\nOccupation", "行业类型\nIndustry Type", "联系邮箱\nEmail", "联系电话\nPhone"]}
                                        rows={formData.familyMembers.map(f => [
                                            f.name, f.relationship, f.nationality, f.workPlace, f.occupation, f.industryType, f.email, f.phone
                                        ])}
                                    />
                                </ReviewCard>

                                {/* 15. ATTACHMENTS */}
                                <ReviewCard title="15. 申请人材料 Application Documents" color="#F59E0B">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {[
                                            { label: '护照照片页 Passport Photo Page', key: 'passportPhotoPage' },
                                            { label: '最高学历证明 Highest Degree Cert', key: 'highestDegreeCertificate' },
                                            { label: '中英文成绩单 Academic Transcripts', key: 'academicTranscripts' },
                                            { label: '语言能力证明 Language Certificate', key: 'languageCertificate' },
                                            { label: '外国人体格检查表 Physical Exam Form', key: 'physicalExamForm' },
                                            { label: '无犯罪记录证明 Non-Criminal record', key: 'noCriminalRecord' },
                                            { label: '经济担保证明 Economic Guarantee', key: 'economicGuarantee' },
                                            { label: '缴费证明 Payment Certificate', key: 'paymentCertificate' },
                                            { label: '监护人保证书 Guardianship Letter', key: 'guardianshipLetter' },
                                            { label: '其他附件 Other Documents', key: 'otherDocuments' }
                                        ].map((doc, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg text-xs border border-slate-100">
                                                <span className="text-slate-500 max-w-[140px] leading-tight">{doc.label}</span>
                                                {formData.documents?.[doc.key] ? (
                                                    <div className="flex items-center gap-3">
                                                        <button
                                                            onClick={() => {
                                                                const url = typeof formData.documents[doc.key] === 'string'
                                                                    ? formData.documents[doc.key]
                                                                    : URL.createObjectURL(formData.documents[doc.key]);
                                                                setPreviewDocUrl(url);
                                                                setShowDocPreviewModal(true);
                                                            }}
                                                            className="text-sky-600 font-bold hover:text-sky-700 underline"
                                                        >
                                                            View
                                                        </button>
                                                        <span className="text-emerald-500 font-bold flex items-center gap-1 shrink-0">
                                                            <Check size={14} /> Uploaded
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="text-red-500 font-bold shrink-0">-</span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </ReviewCard>

                                {/* 16. APPLICANT'S VIDEO */}
                                <ReviewCard title="16. 申请人视频 Applicant's Video" color="#F59E0B">
                                    <div className="bg-slate-50 border border-slate-200 rounded-lg overflow-hidden">
                                        <div className="p-4 bg-slate-100/50 border-b border-slate-200 text-xs font-bold text-slate-600">
                                            自我介绍视频 video of Self-introduction
                                        </div>
                                        <div className="p-8 flex flex-col items-center justify-center min-h-[160px]">
                                            {formData.moreInfo?.video ? (
                                                <div className="flex flex-col items-center gap-3">
                                                    <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shadow-sm">
                                                        <Check size={24} />
                                                    </div>
                                                    <span className="text-emerald-600 font-bold">视频已上传 Video Uploaded</span>
                                                    <div className="flex flex-col items-center gap-2">
                                                        <span className="text-xs text-slate-400">File: {typeof formData.moreInfo.video === 'string' ? 'Cloudinary-Video-Link' : formData.moreInfo.video.name}</span>
                                                        <button
                                                            onClick={() => {
                                                                const url = typeof formData.moreInfo.video === 'string'
                                                                    ? formData.moreInfo.video
                                                                    : URL.createObjectURL(formData.moreInfo.video);
                                                                setPreviewDocUrl(url);
                                                                setShowDocPreviewModal(true);
                                                            }}
                                                            className="px-4 py-1.5 bg-sky-100 text-sky-600 rounded-full font-bold text-[10px] hover:bg-sky-200 transition-all active:scale-95"
                                                        >
                                                            Watch Video
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center gap-3 opacity-40">
                                                    <div className="w-12 h-12 bg-slate-200 text-slate-400 rounded-full flex items-center justify-center">
                                                        <Info size={24} />
                                                    </div>
                                                    <span className="text-slate-500 font-bold italic">未上传视频 No video uploaded</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </ReviewCard>

                                {/* 17. NATIONALITY BACKGROUND */}
                                <ReviewCard title="17. 国籍背景申报 Nationality Background Declaration" color="#F59E0B">
                                    <div className="space-y-6">
                                        <div className="p-4 bg-slate-50 rounded-xl text-xs text-slate-600 leading-relaxed border-l-4 border-amber-400">
                                            移民指申请人原为中国公民(含港澳台地区),后移民到外国并取得外国国籍。请申请者根据个人情况勾选以下信息。如符合上述情况请在勾选后认真填写申报信息。否则将影响后期录取<br />
                                            <span className="italic opacity-75">Immigration refers to that the applicant is a Chinese citizen (including Hong Kong, Macao and Taiwan), and then immigrates to a foreign country and obtains foreign international status. Please check the following information according to your personal situation.</span>
                                        </div>
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-2">
                                            <DetailItem label="申请者是否为移民 Are you an immigrant?" value={formData.moreInfo?.isImmigrant} />
                                            <DetailItem label="是否父母一方是中国公民 Whether parents are Chinese?" value={formData.moreInfo?.hasChineseParent} />
                                            <DetailItem label="原来自国家或地区 Original Country" value={formData.moreInfo?.originalCountry} />
                                            <DetailItem label="何时取得当前国籍 When did you get status?" value={formData.moreInfo?.currentCitizenshipDate} />
                                        </div>
                                    </div>
                                </ReviewCard>

                                {/* 18. AWARD INFORMATION */}
                                <ReviewCard title="18. 奖励信息 Rewards Information" color="#F59E0B" noPadding>
                                    <ReviewTable
                                        headers={["奖励名称\nAward name", "奖励性质\nAward type", "奖励等级\nAward level", "奖励领域\nAward area", "奖励时间\nAward time"]}
                                        rows={formData.moreInfo?.awards?.map(a => [
                                            a.name, a.type, a.level, a.area, a.date
                                        ])}
                                    />
                                </ReviewCard>

                                {/* 19. 监护人信息 Guardian Information */}
                                <ReviewCard title="19. 监护人信息 Guardian Information" color="#F59E0B" noPadding>
                                    <ReviewTable
                                        headers={["姓名\nName", "与学生关系\nRelationship with the student", "单位名称\nWork Place", "职业\nOccupation", "联系电话\nPhone or Mobile", "联系邮箱\nEmail"]}
                                        rows={formData.moreInfo?.guardians?.map(g => [
                                            g.name, g.relationship, g.workPlace, g.occupation, g.phone, g.email
                                        ])}
                                    />
                                </ReviewCard>

                                {/* 20. OTHER INFORMATION */}
                                <ReviewCard title="20. 其它信息 Other Information" color="#F59E0B">
                                    <div className="space-y-8">
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-2">
                                            <DetailItem label="CSC/CIS编号 CSC/CIS NO" value={formData.moreInfo?.otherInfo?.cscNo} />
                                            <DetailItem label="特长爱好 Hobbies" value={formData.moreInfo?.otherInfo?.hobbies} />
                                            <DetailItem label="是否吸烟 Smoking" value={formData.moreInfo?.otherInfo?.isSmoking} />
                                            <DetailItem label="是否有特殊疾病 Special diseases?" value={formData.moreInfo?.otherInfo?.hasDisease} />
                                            <DetailItem label="是否有无犯罪证明 Non-Criminal record?" value={formData.moreInfo?.otherInfo?.hasCriminalRecord} />
                                            <DetailItem label="是否曾有过犯罪史 Criminal history?" value={formData.moreInfo?.otherInfo?.hasCriminalHistory} />
                                            <DetailItem label="是否有体检表 Physical exam form?" value={formData.moreInfo?.otherInfo?.hasPhysicalExam} />
                                        </div>
                                        <div className="space-y-3">
                                            <h4 className="text-sm font-bold text-slate-700">申请备注 Application Note</h4>
                                            <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 text-sm text-slate-700 min-h-[100px] whitespace-pre-wrap">
                                                {renderReviewValue(formData.moreInfo?.applicationNote)}
                                            </div>
                                        </div>
                                    </div>
                                </ReviewCard>

                                {/* Progress/Action Area */}
                                <div className="mt-12 space-y-8">
                                    <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-8">
                                        <label className="flex items-start gap-4 p-6 bg-blue-50/50 rounded-2xl cursor-pointer hover:bg-blue-50 transition-all border border-blue-100 group">
                                            <div className="relative flex items-center shrink-0 mt-1">
                                                <input
                                                    type="checkbox"
                                                    checked={termsAccepted}
                                                    onChange={(e) => setTermsAccepted(e.target.checked)}
                                                    className="w-6 h-6 text-blue-600 rounded-lg border-blue-200 focus:ring-blue-500 cursor-pointer transition-all"
                                                />
                                            </div>
                                            <span className="text-sm text-slate-700 leading-relaxed font-medium">
                                                我保证本表中所填写的内容和提供的材料真实无误。如果提供虚假信息，我将承担由此产生的一切后果。
                                                <br />
                                                <span className="text-xs text-slate-500 italic mt-1 block">I certify that all information provided in this application is true and correct. I understand that any false information may result in the rejection of my application or cancellation of admission.</span>
                                            </span>
                                        </label>

                                        {/* Warning Caption */}
                                        <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                                            <div className="flex items-start gap-3">
                                                <svg className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                </svg>
                                                <div>
                                                    <p className="text-sm font-semibold text-amber-800">重要提示 Important Notice</p>
                                                    <p className="text-xs text-amber-700 mt-1">
                                                        提交申请后，您将无法再修改申请内容。请确保所有信息准确无误后再提交。
                                                    </p>
                                                    <p className="text-xs text-amber-600 italic mt-1">
                                                        Once submitted, you will NOT be able to edit your application. Please make sure all information is accurate before submitting.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-10">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setActiveMainTab(4)
                                                    window.scrollTo({ top: 0, behavior: 'smooth' })
                                                }}
                                                className="w-full sm:w-auto px-8 py-4 bg-slate-100 text-slate-600 font-bold rounded-[1.25rem] hover:bg-slate-200 transition-all flex items-center justify-center gap-2 border border-slate-200"
                                            >
                                                <ChevronLeft size={20} /> 返回修改 Back to Edit
                                            </button>

                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    handleSubmitApplication();
                                                }}
                                                disabled={loading || !termsAccepted}
                                                className="w-full sm:w-auto px-16 py-4 bg-[#1e40af] text-white font-bold rounded-[1.25rem] shadow-xl shadow-blue-900/20 hover:shadow-blue-900/30 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed flex items-center justify-center gap-3"
                                            >
                                                {loading ? (
                                                    <>
                                                        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                                        提交中 Submitting...
                                                    </>
                                                ) : (
                                                    <>
                                                        确认提交 Submit Application
                                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="text-center pb-10">
                                        <p className="text-xs text-slate-400">
                                            ThePlanetScholar Application System v2.0 &bull; Secure Submission Mode
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </form>
                </div>
            </main>

            {showDocPreviewModal && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-8 animate-fadeIn">
                    <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-xl transition-opacity" onClick={() => setShowDocPreviewModal(false)} />

                    <div className="bg-white w-full max-w-6xl h-full max-h-[90vh] rounded-[2.5rem] shadow-2xl relative z-10 flex flex-col overflow-hidden border border-slate-200">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-sky-50 text-sky-600 rounded-2xl flex items-center justify-center">
                                    <FileText size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800 tracking-tight">预览文件 Document Preview</h3>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">ThePlanetScholar Application System</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <a
                                    href={previewDocUrl}
                                    download
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-3 hover:bg-emerald-50 rounded-2xl transition-all text-slate-400 hover:text-emerald-600 flex items-center gap-2 group"
                                >
                                    <span className="text-xs font-bold hidden md:block">下载 Download</span>
                                    <Download size={20} className="group-hover:scale-110 transition-transform" />
                                </a>
                                <button
                                    onClick={() => setShowDocPreviewModal(false)}
                                    className="p-3 hover:bg-rose-50 rounded-2xl transition-all text-slate-400 hover:text-rose-600"
                                >
                                    <X size={24} />
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 bg-slate-100 relative overflow-hidden">
                            {(() => {
                                if (!previewDocUrl) {
                                    return (
                                        <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">
                                            No file selected
                                        </div>
                                    )
                                }

                                const lower = (previewDocUrl && typeof previewDocUrl === 'string') ? previewDocUrl.toLowerCase() : ''
                                const isImage = /\.(jpg|jpeg|png|gif|webp|bmp|tif|tiff)(\?|$)/.test(lower) || lower.includes('/image/upload/')
                                const isVideo = /\.(mp4|webm|ogg|mov|m4v)(\?|$)/.test(lower) || lower.includes('/video/upload/')
                                const isOfficeDoc = /\.(doc|docx|xls|xlsx|ppt|pptx)(\?|$)/.test(lower)

                                if (isImage) {
                                    return (
                                        <div className="w-full h-full flex items-center justify-center bg-slate-900/5 p-4 md:p-12">
                                            <img
                                                src={previewDocUrl}
                                                alt="Document"
                                                className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl border-4 border-white"
                                                loading="lazy"
                                            />
                                        </div>
                                    )
                                }

                                if (isVideo) {
                                    return (
                                        <div className="w-full h-full flex items-center justify-center bg-black">
                                            <video
                                                src={previewDocUrl}
                                                controls
                                                autoPlay
                                                className="max-w-full max-h-full shadow-2xl"
                                            />
                                        </div>
                                    )
                                }

                                if (isOfficeDoc) {
                                    return (
                                        <div className="w-full h-full relative bg-white">
                                            <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-sm animate-pulse z-0">
                                                Loading Office Document...
                                            </div>
                                            <iframe
                                                src={`https://docs.google.com/viewer?url=${encodeURIComponent(previewDocUrl)}&embedded=true`}
                                                className="w-full h-full border-none relative z-10"
                                                title="Office Document Preview"
                                            />
                                        </div>
                                    )
                                }

                                // Default: use iframe for PDFs and unknown types
                                return (
                                    <iframe
                                        src={previewDocUrl}
                                        className="w-full h-full border-none bg-white font-sans"
                                        title="Document Preview"
                                    />
                                )
                            })()}
                        </div>

                        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-center">
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">
                                Secure Document Management &bull; ThePlanetScholar
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
