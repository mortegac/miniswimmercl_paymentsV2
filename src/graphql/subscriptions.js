/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const onCreateAcademyStudents = /* GraphQL */ `
  subscription OnCreateAcademyStudents(
    $filter: ModelSubscriptionAcademyStudentsFilterInput
  ) {
    onCreateAcademyStudents(filter: $filter) {
      id
      status
      name
      urlImage
      email
      birthdate
      years
      address
      phone
      profession
      studiesRelated
      medicalHistory
      emergencyContact
      isPaid
      isSponsored
      certificate {
        id
        title
        studentName
        instructorName
        instructorSignature
        descriptionOne
        theoreticalHours
        practicalHours
        date
        isOfficialCertification
        location
        createdAt
        updatedAt
        certificatesStudentId
        certificatesCourseId
        __typename
      }
      createdAt
      updatedAt
      academyCoursesStudentsId
      academyStudentsCertificateId
      __typename
    }
  }
`;
export const onUpdateAcademyStudents = /* GraphQL */ `
  subscription OnUpdateAcademyStudents(
    $filter: ModelSubscriptionAcademyStudentsFilterInput
  ) {
    onUpdateAcademyStudents(filter: $filter) {
      id
      status
      name
      urlImage
      email
      birthdate
      years
      address
      phone
      profession
      studiesRelated
      medicalHistory
      emergencyContact
      isPaid
      isSponsored
      certificate {
        id
        title
        studentName
        instructorName
        instructorSignature
        descriptionOne
        theoreticalHours
        practicalHours
        date
        isOfficialCertification
        location
        createdAt
        updatedAt
        certificatesStudentId
        certificatesCourseId
        __typename
      }
      createdAt
      updatedAt
      academyCoursesStudentsId
      academyStudentsCertificateId
      __typename
    }
  }
`;
export const onDeleteAcademyStudents = /* GraphQL */ `
  subscription OnDeleteAcademyStudents(
    $filter: ModelSubscriptionAcademyStudentsFilterInput
  ) {
    onDeleteAcademyStudents(filter: $filter) {
      id
      status
      name
      urlImage
      email
      birthdate
      years
      address
      phone
      profession
      studiesRelated
      medicalHistory
      emergencyContact
      isPaid
      isSponsored
      certificate {
        id
        title
        studentName
        instructorName
        instructorSignature
        descriptionOne
        theoreticalHours
        practicalHours
        date
        isOfficialCertification
        location
        createdAt
        updatedAt
        certificatesStudentId
        certificatesCourseId
        __typename
      }
      createdAt
      updatedAt
      academyCoursesStudentsId
      academyStudentsCertificateId
      __typename
    }
  }
`;
export const onCreateCertificates = /* GraphQL */ `
  subscription OnCreateCertificates(
    $filter: ModelSubscriptionCertificatesFilterInput
  ) {
    onCreateCertificates(filter: $filter) {
      id
      title
      studentName
      instructorName
      instructorSignature
      descriptionOne
      theoreticalHours
      practicalHours
      date
      isOfficialCertification
      location
      student {
        id
        status
        name
        urlImage
        email
        birthdate
        years
        address
        phone
        profession
        studiesRelated
        medicalHistory
        emergencyContact
        isPaid
        isSponsored
        createdAt
        updatedAt
        academyCoursesStudentsId
        academyStudentsCertificateId
        __typename
      }
      course {
        id
        name
        description
        isActive
        createdAt
        updatedAt
        academyCoursesCertificateId
        __typename
      }
      createdAt
      updatedAt
      certificatesStudentId
      certificatesCourseId
      __typename
    }
  }
`;
export const onUpdateCertificates = /* GraphQL */ `
  subscription OnUpdateCertificates(
    $filter: ModelSubscriptionCertificatesFilterInput
  ) {
    onUpdateCertificates(filter: $filter) {
      id
      title
      studentName
      instructorName
      instructorSignature
      descriptionOne
      theoreticalHours
      practicalHours
      date
      isOfficialCertification
      location
      student {
        id
        status
        name
        urlImage
        email
        birthdate
        years
        address
        phone
        profession
        studiesRelated
        medicalHistory
        emergencyContact
        isPaid
        isSponsored
        createdAt
        updatedAt
        academyCoursesStudentsId
        academyStudentsCertificateId
        __typename
      }
      course {
        id
        name
        description
        isActive
        createdAt
        updatedAt
        academyCoursesCertificateId
        __typename
      }
      createdAt
      updatedAt
      certificatesStudentId
      certificatesCourseId
      __typename
    }
  }
`;
export const onDeleteCertificates = /* GraphQL */ `
  subscription OnDeleteCertificates(
    $filter: ModelSubscriptionCertificatesFilterInput
  ) {
    onDeleteCertificates(filter: $filter) {
      id
      title
      studentName
      instructorName
      instructorSignature
      descriptionOne
      theoreticalHours
      practicalHours
      date
      isOfficialCertification
      location
      student {
        id
        status
        name
        urlImage
        email
        birthdate
        years
        address
        phone
        profession
        studiesRelated
        medicalHistory
        emergencyContact
        isPaid
        isSponsored
        createdAt
        updatedAt
        academyCoursesStudentsId
        academyStudentsCertificateId
        __typename
      }
      course {
        id
        name
        description
        isActive
        createdAt
        updatedAt
        academyCoursesCertificateId
        __typename
      }
      createdAt
      updatedAt
      certificatesStudentId
      certificatesCourseId
      __typename
    }
  }
`;
export const onCreateAcademyCourses = /* GraphQL */ `
  subscription OnCreateAcademyCourses(
    $filter: ModelSubscriptionAcademyCoursesFilterInput
  ) {
    onCreateAcademyCourses(filter: $filter) {
      id
      name
      description
      isActive
      students {
        nextToken
        __typename
      }
      certificate {
        id
        title
        studentName
        instructorName
        instructorSignature
        descriptionOne
        theoreticalHours
        practicalHours
        date
        isOfficialCertification
        location
        createdAt
        updatedAt
        certificatesStudentId
        certificatesCourseId
        __typename
      }
      createdAt
      updatedAt
      academyCoursesCertificateId
      __typename
    }
  }
`;
export const onUpdateAcademyCourses = /* GraphQL */ `
  subscription OnUpdateAcademyCourses(
    $filter: ModelSubscriptionAcademyCoursesFilterInput
  ) {
    onUpdateAcademyCourses(filter: $filter) {
      id
      name
      description
      isActive
      students {
        nextToken
        __typename
      }
      certificate {
        id
        title
        studentName
        instructorName
        instructorSignature
        descriptionOne
        theoreticalHours
        practicalHours
        date
        isOfficialCertification
        location
        createdAt
        updatedAt
        certificatesStudentId
        certificatesCourseId
        __typename
      }
      createdAt
      updatedAt
      academyCoursesCertificateId
      __typename
    }
  }
`;
export const onDeleteAcademyCourses = /* GraphQL */ `
  subscription OnDeleteAcademyCourses(
    $filter: ModelSubscriptionAcademyCoursesFilterInput
  ) {
    onDeleteAcademyCourses(filter: $filter) {
      id
      name
      description
      isActive
      students {
        nextToken
        __typename
      }
      certificate {
        id
        title
        studentName
        instructorName
        instructorSignature
        descriptionOne
        theoreticalHours
        practicalHours
        date
        isOfficialCertification
        location
        createdAt
        updatedAt
        certificatesStudentId
        certificatesCourseId
        __typename
      }
      createdAt
      updatedAt
      academyCoursesCertificateId
      __typename
    }
  }
`;
export const onCreateEmailSend = /* GraphQL */ `
  subscription OnCreateEmailSend(
    $filter: ModelSubscriptionEmailSendFilterInput
  ) {
    onCreateEmailSend(filter: $filter) {
      id
      date
      type
      contentEmail
      email
      wasSent
      userSend {
        id
        name
        email
        validated
        contactPhone
        ig
        firstContact
        createdAt
        updatedAt
        usersRolesId
        __typename
      }
      student {
        id
        name
        lastName
        middleName
        birthdate
        placeOfResidence
        contactPhone
        whoIsTheContact
        emailPhone
        gender
        firstSwimmingClass
        attendedDaycare
        immersesWithoutSwallowingWater
        bornPrematurely
        waterOnHisFaceBothersHim
        putYourFaceInTheWater
        anyIllnessInjuryMedicalCondition
        createdAt
        updatedAt
        studentSessionDetailId
        __typename
      }
      createdAt
      updatedAt
      studentEmailSendId
      usersEmailSendId
      __typename
    }
  }
`;
export const onUpdateEmailSend = /* GraphQL */ `
  subscription OnUpdateEmailSend(
    $filter: ModelSubscriptionEmailSendFilterInput
  ) {
    onUpdateEmailSend(filter: $filter) {
      id
      date
      type
      contentEmail
      email
      wasSent
      userSend {
        id
        name
        email
        validated
        contactPhone
        ig
        firstContact
        createdAt
        updatedAt
        usersRolesId
        __typename
      }
      student {
        id
        name
        lastName
        middleName
        birthdate
        placeOfResidence
        contactPhone
        whoIsTheContact
        emailPhone
        gender
        firstSwimmingClass
        attendedDaycare
        immersesWithoutSwallowingWater
        bornPrematurely
        waterOnHisFaceBothersHim
        putYourFaceInTheWater
        anyIllnessInjuryMedicalCondition
        createdAt
        updatedAt
        studentSessionDetailId
        __typename
      }
      createdAt
      updatedAt
      studentEmailSendId
      usersEmailSendId
      __typename
    }
  }
`;
export const onDeleteEmailSend = /* GraphQL */ `
  subscription OnDeleteEmailSend(
    $filter: ModelSubscriptionEmailSendFilterInput
  ) {
    onDeleteEmailSend(filter: $filter) {
      id
      date
      type
      contentEmail
      email
      wasSent
      userSend {
        id
        name
        email
        validated
        contactPhone
        ig
        firstContact
        createdAt
        updatedAt
        usersRolesId
        __typename
      }
      student {
        id
        name
        lastName
        middleName
        birthdate
        placeOfResidence
        contactPhone
        whoIsTheContact
        emailPhone
        gender
        firstSwimmingClass
        attendedDaycare
        immersesWithoutSwallowingWater
        bornPrematurely
        waterOnHisFaceBothersHim
        putYourFaceInTheWater
        anyIllnessInjuryMedicalCondition
        createdAt
        updatedAt
        studentSessionDetailId
        __typename
      }
      createdAt
      updatedAt
      studentEmailSendId
      usersEmailSendId
      __typename
    }
  }
`;
export const onCreateSentEmail = /* GraphQL */ `
  subscription OnCreateSentEmail(
    $filter: ModelSubscriptionSentEmailFilterInput
  ) {
    onCreateSentEmail(filter: $filter) {
      id
      emailState
      body
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const onUpdateSentEmail = /* GraphQL */ `
  subscription OnUpdateSentEmail(
    $filter: ModelSubscriptionSentEmailFilterInput
  ) {
    onUpdateSentEmail(filter: $filter) {
      id
      emailState
      body
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const onDeleteSentEmail = /* GraphQL */ `
  subscription OnDeleteSentEmail(
    $filter: ModelSubscriptionSentEmailFilterInput
  ) {
    onDeleteSentEmail(filter: $filter) {
      id
      emailState
      body
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const onCreateExpense = /* GraphQL */ `
  subscription OnCreateExpense($filter: ModelSubscriptionExpenseFilterInput) {
    onCreateExpense(filter: $filter) {
      id
      amount
      description
      date
      day
      month
      year
      expenseType
      costCenterType
      location {
        id
        name
        city
        minimumTemperature
        maximumTemperature
        address
        phone
        imageMap
        urlMap
        directions
        createdAt
        updatedAt
        __typename
      }
      createdAt
      updatedAt
      locationExpensesId
      __typename
    }
  }
`;
export const onUpdateExpense = /* GraphQL */ `
  subscription OnUpdateExpense($filter: ModelSubscriptionExpenseFilterInput) {
    onUpdateExpense(filter: $filter) {
      id
      amount
      description
      date
      day
      month
      year
      expenseType
      costCenterType
      location {
        id
        name
        city
        minimumTemperature
        maximumTemperature
        address
        phone
        imageMap
        urlMap
        directions
        createdAt
        updatedAt
        __typename
      }
      createdAt
      updatedAt
      locationExpensesId
      __typename
    }
  }
`;
export const onDeleteExpense = /* GraphQL */ `
  subscription OnDeleteExpense($filter: ModelSubscriptionExpenseFilterInput) {
    onDeleteExpense(filter: $filter) {
      id
      amount
      description
      date
      day
      month
      year
      expenseType
      costCenterType
      location {
        id
        name
        city
        minimumTemperature
        maximumTemperature
        address
        phone
        imageMap
        urlMap
        directions
        createdAt
        updatedAt
        __typename
      }
      createdAt
      updatedAt
      locationExpensesId
      __typename
    }
  }
`;
export const onCreateParametersEnc = /* GraphQL */ `
  subscription OnCreateParametersEnc(
    $filter: ModelSubscriptionParametersEncFilterInput
  ) {
    onCreateParametersEnc(filter: $filter) {
      id
      typeOfParameter {
        nextToken
        __typename
      }
      description
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const onUpdateParametersEnc = /* GraphQL */ `
  subscription OnUpdateParametersEnc(
    $filter: ModelSubscriptionParametersEncFilterInput
  ) {
    onUpdateParametersEnc(filter: $filter) {
      id
      typeOfParameter {
        nextToken
        __typename
      }
      description
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const onDeleteParametersEnc = /* GraphQL */ `
  subscription OnDeleteParametersEnc(
    $filter: ModelSubscriptionParametersEncFilterInput
  ) {
    onDeleteParametersEnc(filter: $filter) {
      id
      typeOfParameter {
        nextToken
        __typename
      }
      description
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const onCreateMetadata = /* GraphQL */ `
  subscription OnCreateMetadata($filter: ModelSubscriptionMetadataFilterInput) {
    onCreateMetadata(filter: $filter) {
      id
      key
      value
      metadata {
        id
        label
        value
        idParent
        createdAt
        updatedAt
        parametersEncTypeOfParameterId
        __typename
      }
      createdAt
      updatedAt
      parametersMetadataId
      __typename
    }
  }
`;
export const onUpdateMetadata = /* GraphQL */ `
  subscription OnUpdateMetadata($filter: ModelSubscriptionMetadataFilterInput) {
    onUpdateMetadata(filter: $filter) {
      id
      key
      value
      metadata {
        id
        label
        value
        idParent
        createdAt
        updatedAt
        parametersEncTypeOfParameterId
        __typename
      }
      createdAt
      updatedAt
      parametersMetadataId
      __typename
    }
  }
`;
export const onDeleteMetadata = /* GraphQL */ `
  subscription OnDeleteMetadata($filter: ModelSubscriptionMetadataFilterInput) {
    onDeleteMetadata(filter: $filter) {
      id
      key
      value
      metadata {
        id
        label
        value
        idParent
        createdAt
        updatedAt
        parametersEncTypeOfParameterId
        __typename
      }
      createdAt
      updatedAt
      parametersMetadataId
      __typename
    }
  }
`;
export const onCreateParameters = /* GraphQL */ `
  subscription OnCreateParameters(
    $filter: ModelSubscriptionParametersFilterInput
  ) {
    onCreateParameters(filter: $filter) {
      id
      typeOfParameter {
        id
        description
        createdAt
        updatedAt
        __typename
      }
      label
      value
      idParent
      metadata {
        nextToken
        __typename
      }
      createdAt
      updatedAt
      parametersEncTypeOfParameterId
      __typename
    }
  }
`;
export const onUpdateParameters = /* GraphQL */ `
  subscription OnUpdateParameters(
    $filter: ModelSubscriptionParametersFilterInput
  ) {
    onUpdateParameters(filter: $filter) {
      id
      typeOfParameter {
        id
        description
        createdAt
        updatedAt
        __typename
      }
      label
      value
      idParent
      metadata {
        nextToken
        __typename
      }
      createdAt
      updatedAt
      parametersEncTypeOfParameterId
      __typename
    }
  }
`;
export const onDeleteParameters = /* GraphQL */ `
  subscription OnDeleteParameters(
    $filter: ModelSubscriptionParametersFilterInput
  ) {
    onDeleteParameters(filter: $filter) {
      id
      typeOfParameter {
        id
        description
        createdAt
        updatedAt
        __typename
      }
      label
      value
      idParent
      metadata {
        nextToken
        __typename
      }
      createdAt
      updatedAt
      parametersEncTypeOfParameterId
      __typename
    }
  }
`;
export const onCreateRoles = /* GraphQL */ `
  subscription OnCreateRoles($filter: ModelSubscriptionRolesFilterInput) {
    onCreateRoles(filter: $filter) {
      id
      name
      displayName
      icon
      rolPermissions {
        nextToken
        __typename
      }
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const onUpdateRoles = /* GraphQL */ `
  subscription OnUpdateRoles($filter: ModelSubscriptionRolesFilterInput) {
    onUpdateRoles(filter: $filter) {
      id
      name
      displayName
      icon
      rolPermissions {
        nextToken
        __typename
      }
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const onDeleteRoles = /* GraphQL */ `
  subscription OnDeleteRoles($filter: ModelSubscriptionRolesFilterInput) {
    onDeleteRoles(filter: $filter) {
      id
      name
      displayName
      icon
      rolPermissions {
        nextToken
        __typename
      }
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const onCreatePermissions = /* GraphQL */ `
  subscription OnCreatePermissions(
    $filter: ModelSubscriptionPermissionsFilterInput
  ) {
    onCreatePermissions(filter: $filter) {
      id
      displayName
      name
      icon
      order
      Padre {
        id
        displayName
        name
        icon
        order
        createdAt
        updatedAt
        permissionsSubmenuId
        __typename
      }
      Submenu {
        nextToken
        __typename
      }
      rolPermissions {
        nextToken
        __typename
      }
      userPermissions {
        nextToken
        __typename
      }
      createdAt
      updatedAt
      permissionsSubmenuId
      __typename
    }
  }
`;
export const onUpdatePermissions = /* GraphQL */ `
  subscription OnUpdatePermissions(
    $filter: ModelSubscriptionPermissionsFilterInput
  ) {
    onUpdatePermissions(filter: $filter) {
      id
      displayName
      name
      icon
      order
      Padre {
        id
        displayName
        name
        icon
        order
        createdAt
        updatedAt
        permissionsSubmenuId
        __typename
      }
      Submenu {
        nextToken
        __typename
      }
      rolPermissions {
        nextToken
        __typename
      }
      userPermissions {
        nextToken
        __typename
      }
      createdAt
      updatedAt
      permissionsSubmenuId
      __typename
    }
  }
`;
export const onDeletePermissions = /* GraphQL */ `
  subscription OnDeletePermissions(
    $filter: ModelSubscriptionPermissionsFilterInput
  ) {
    onDeletePermissions(filter: $filter) {
      id
      displayName
      name
      icon
      order
      Padre {
        id
        displayName
        name
        icon
        order
        createdAt
        updatedAt
        permissionsSubmenuId
        __typename
      }
      Submenu {
        nextToken
        __typename
      }
      rolPermissions {
        nextToken
        __typename
      }
      userPermissions {
        nextToken
        __typename
      }
      createdAt
      updatedAt
      permissionsSubmenuId
      __typename
    }
  }
`;
export const onCreateLocation = /* GraphQL */ `
  subscription OnCreateLocation($filter: ModelSubscriptionLocationFilterInput) {
    onCreateLocation(filter: $filter) {
      id
      name
      city
      minimumTemperature
      maximumTemperature
      address
      phone
      imageMap
      urlMap
      directions
      courses {
        nextToken
        __typename
      }
      schedules {
        nextToken
        __typename
      }
      expenses {
        nextToken
        __typename
      }
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const onUpdateLocation = /* GraphQL */ `
  subscription OnUpdateLocation($filter: ModelSubscriptionLocationFilterInput) {
    onUpdateLocation(filter: $filter) {
      id
      name
      city
      minimumTemperature
      maximumTemperature
      address
      phone
      imageMap
      urlMap
      directions
      courses {
        nextToken
        __typename
      }
      schedules {
        nextToken
        __typename
      }
      expenses {
        nextToken
        __typename
      }
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const onDeleteLocation = /* GraphQL */ `
  subscription OnDeleteLocation($filter: ModelSubscriptionLocationFilterInput) {
    onDeleteLocation(filter: $filter) {
      id
      name
      city
      minimumTemperature
      maximumTemperature
      address
      phone
      imageMap
      urlMap
      directions
      courses {
        nextToken
        __typename
      }
      schedules {
        nextToken
        __typename
      }
      expenses {
        nextToken
        __typename
      }
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const onCreateCourse = /* GraphQL */ `
  subscription OnCreateCourse($filter: ModelSubscriptionCourseFilterInput) {
    onCreateCourse(filter: $filter) {
      id
      title
      description
      startingAge
      endingAge
      ageType
      AgeGroupType
      duration
      isActive
      location {
        id
        name
        city
        minimumTemperature
        maximumTemperature
        address
        phone
        imageMap
        urlMap
        directions
        createdAt
        updatedAt
        __typename
      }
      schedules {
        nextToken
        __typename
      }
      sessionTypes {
        nextToken
        __typename
      }
      enrollments {
        nextToken
        __typename
      }
      createdAt
      updatedAt
      locationCoursesId
      __typename
    }
  }
`;
export const onUpdateCourse = /* GraphQL */ `
  subscription OnUpdateCourse($filter: ModelSubscriptionCourseFilterInput) {
    onUpdateCourse(filter: $filter) {
      id
      title
      description
      startingAge
      endingAge
      ageType
      AgeGroupType
      duration
      isActive
      location {
        id
        name
        city
        minimumTemperature
        maximumTemperature
        address
        phone
        imageMap
        urlMap
        directions
        createdAt
        updatedAt
        __typename
      }
      schedules {
        nextToken
        __typename
      }
      sessionTypes {
        nextToken
        __typename
      }
      enrollments {
        nextToken
        __typename
      }
      createdAt
      updatedAt
      locationCoursesId
      __typename
    }
  }
`;
export const onDeleteCourse = /* GraphQL */ `
  subscription OnDeleteCourse($filter: ModelSubscriptionCourseFilterInput) {
    onDeleteCourse(filter: $filter) {
      id
      title
      description
      startingAge
      endingAge
      ageType
      AgeGroupType
      duration
      isActive
      location {
        id
        name
        city
        minimumTemperature
        maximumTemperature
        address
        phone
        imageMap
        urlMap
        directions
        createdAt
        updatedAt
        __typename
      }
      schedules {
        nextToken
        __typename
      }
      sessionTypes {
        nextToken
        __typename
      }
      enrollments {
        nextToken
        __typename
      }
      createdAt
      updatedAt
      locationCoursesId
      __typename
    }
  }
`;
export const onCreateSchedule = /* GraphQL */ `
  subscription OnCreateSchedule($filter: ModelSubscriptionScheduleFilterInput) {
    onCreateSchedule(filter: $filter) {
      id
      day
      startHour
      endHour
      isActive
      minimumQuotas
      maximumQuotas
      course {
        id
        title
        description
        startingAge
        endingAge
        ageType
        AgeGroupType
        duration
        isActive
        createdAt
        updatedAt
        locationCoursesId
        __typename
      }
      location {
        id
        name
        city
        minimumTemperature
        maximumTemperature
        address
        phone
        imageMap
        urlMap
        directions
        createdAt
        updatedAt
        __typename
      }
      createdAt
      updatedAt
      locationSchedulesId
      courseSchedulesId
      __typename
    }
  }
`;
export const onUpdateSchedule = /* GraphQL */ `
  subscription OnUpdateSchedule($filter: ModelSubscriptionScheduleFilterInput) {
    onUpdateSchedule(filter: $filter) {
      id
      day
      startHour
      endHour
      isActive
      minimumQuotas
      maximumQuotas
      course {
        id
        title
        description
        startingAge
        endingAge
        ageType
        AgeGroupType
        duration
        isActive
        createdAt
        updatedAt
        locationCoursesId
        __typename
      }
      location {
        id
        name
        city
        minimumTemperature
        maximumTemperature
        address
        phone
        imageMap
        urlMap
        directions
        createdAt
        updatedAt
        __typename
      }
      createdAt
      updatedAt
      locationSchedulesId
      courseSchedulesId
      __typename
    }
  }
`;
export const onDeleteSchedule = /* GraphQL */ `
  subscription OnDeleteSchedule($filter: ModelSubscriptionScheduleFilterInput) {
    onDeleteSchedule(filter: $filter) {
      id
      day
      startHour
      endHour
      isActive
      minimumQuotas
      maximumQuotas
      course {
        id
        title
        description
        startingAge
        endingAge
        ageType
        AgeGroupType
        duration
        isActive
        createdAt
        updatedAt
        locationCoursesId
        __typename
      }
      location {
        id
        name
        city
        minimumTemperature
        maximumTemperature
        address
        phone
        imageMap
        urlMap
        directions
        createdAt
        updatedAt
        __typename
      }
      createdAt
      updatedAt
      locationSchedulesId
      courseSchedulesId
      __typename
    }
  }
`;
export const onCreateSessionType = /* GraphQL */ `
  subscription OnCreateSessionType(
    $filter: ModelSubscriptionSessionTypeFilterInput
  ) {
    onCreateSessionType(filter: $filter) {
      id
      name
      description
      durationSession
      timeAWeek
      totalSessions
      amount
      packValidity
      courses {
        nextToken
        __typename
      }
      enrollments {
        nextToken
        __typename
      }
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const onUpdateSessionType = /* GraphQL */ `
  subscription OnUpdateSessionType(
    $filter: ModelSubscriptionSessionTypeFilterInput
  ) {
    onUpdateSessionType(filter: $filter) {
      id
      name
      description
      durationSession
      timeAWeek
      totalSessions
      amount
      packValidity
      courses {
        nextToken
        __typename
      }
      enrollments {
        nextToken
        __typename
      }
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const onDeleteSessionType = /* GraphQL */ `
  subscription OnDeleteSessionType(
    $filter: ModelSubscriptionSessionTypeFilterInput
  ) {
    onDeleteSessionType(filter: $filter) {
      id
      name
      description
      durationSession
      timeAWeek
      totalSessions
      amount
      packValidity
      courses {
        nextToken
        __typename
      }
      enrollments {
        nextToken
        __typename
      }
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const onCreateStudent = /* GraphQL */ `
  subscription OnCreateStudent($filter: ModelSubscriptionStudentFilterInput) {
    onCreateStudent(filter: $filter) {
      id
      name
      lastName
      middleName
      birthdate
      placeOfResidence
      contactPhone
      whoIsTheContact
      emailPhone
      gender
      firstSwimmingClass
      attendedDaycare
      immersesWithoutSwallowingWater
      bornPrematurely
      waterOnHisFaceBothersHim
      putYourFaceInTheWater
      anyIllnessInjuryMedicalCondition
      enrollments {
        nextToken
        __typename
      }
      relationships {
        nextToken
        __typename
      }
      sessionDetail {
        id
        date
        day
        month
        year
        sessionNumber
        totalSessions
        status
        proratedValue
        wasEmailSent
        locationId
        locationIdUsed
        createdAt
        updatedAt
        enrollmentSessionDetailsId
        sessionDetailStudentId
        __typename
      }
      emailSend {
        nextToken
        __typename
      }
      createdAt
      updatedAt
      studentSessionDetailId
      __typename
    }
  }
`;
export const onUpdateStudent = /* GraphQL */ `
  subscription OnUpdateStudent($filter: ModelSubscriptionStudentFilterInput) {
    onUpdateStudent(filter: $filter) {
      id
      name
      lastName
      middleName
      birthdate
      placeOfResidence
      contactPhone
      whoIsTheContact
      emailPhone
      gender
      firstSwimmingClass
      attendedDaycare
      immersesWithoutSwallowingWater
      bornPrematurely
      waterOnHisFaceBothersHim
      putYourFaceInTheWater
      anyIllnessInjuryMedicalCondition
      enrollments {
        nextToken
        __typename
      }
      relationships {
        nextToken
        __typename
      }
      sessionDetail {
        id
        date
        day
        month
        year
        sessionNumber
        totalSessions
        status
        proratedValue
        wasEmailSent
        locationId
        locationIdUsed
        createdAt
        updatedAt
        enrollmentSessionDetailsId
        sessionDetailStudentId
        __typename
      }
      emailSend {
        nextToken
        __typename
      }
      createdAt
      updatedAt
      studentSessionDetailId
      __typename
    }
  }
`;
export const onDeleteStudent = /* GraphQL */ `
  subscription OnDeleteStudent($filter: ModelSubscriptionStudentFilterInput) {
    onDeleteStudent(filter: $filter) {
      id
      name
      lastName
      middleName
      birthdate
      placeOfResidence
      contactPhone
      whoIsTheContact
      emailPhone
      gender
      firstSwimmingClass
      attendedDaycare
      immersesWithoutSwallowingWater
      bornPrematurely
      waterOnHisFaceBothersHim
      putYourFaceInTheWater
      anyIllnessInjuryMedicalCondition
      enrollments {
        nextToken
        __typename
      }
      relationships {
        nextToken
        __typename
      }
      sessionDetail {
        id
        date
        day
        month
        year
        sessionNumber
        totalSessions
        status
        proratedValue
        wasEmailSent
        locationId
        locationIdUsed
        createdAt
        updatedAt
        enrollmentSessionDetailsId
        sessionDetailStudentId
        __typename
      }
      emailSend {
        nextToken
        __typename
      }
      createdAt
      updatedAt
      studentSessionDetailId
      __typename
    }
  }
`;
export const onCreateEnrollment = /* GraphQL */ `
  subscription OnCreateEnrollment(
    $filter: ModelSubscriptionEnrollmentFilterInput
  ) {
    onCreateEnrollment(filter: $filter) {
      id
      amountPaid
      startDate
      endDate
      wasPaid
      timeAWeek
      numberOfSessions
      sessionsLeft
      sessionsUsed
      scheduleId
      scheduleName
      student {
        id
        name
        lastName
        middleName
        birthdate
        placeOfResidence
        contactPhone
        whoIsTheContact
        emailPhone
        gender
        firstSwimmingClass
        attendedDaycare
        immersesWithoutSwallowingWater
        bornPrematurely
        waterOnHisFaceBothersHim
        putYourFaceInTheWater
        anyIllnessInjuryMedicalCondition
        createdAt
        updatedAt
        studentSessionDetailId
        __typename
      }
      sessionType {
        id
        name
        description
        durationSession
        timeAWeek
        totalSessions
        amount
        packValidity
        createdAt
        updatedAt
        __typename
      }
      course {
        id
        title
        description
        startingAge
        endingAge
        ageType
        AgeGroupType
        duration
        isActive
        createdAt
        updatedAt
        locationCoursesId
        __typename
      }
      transaction {
        id
        amount
        date
        paymentMethod
        status
        createdAt
        updatedAt
        transactionEnrollmentId
        __typename
      }
      sessionDetails {
        nextToken
        __typename
      }
      createdAt
      updatedAt
      courseEnrollmentsId
      sessionTypeEnrollmentsId
      studentEnrollmentsId
      enrollmentTransactionId
      __typename
    }
  }
`;
export const onUpdateEnrollment = /* GraphQL */ `
  subscription OnUpdateEnrollment(
    $filter: ModelSubscriptionEnrollmentFilterInput
  ) {
    onUpdateEnrollment(filter: $filter) {
      id
      amountPaid
      startDate
      endDate
      wasPaid
      timeAWeek
      numberOfSessions
      sessionsLeft
      sessionsUsed
      scheduleId
      scheduleName
      student {
        id
        name
        lastName
        middleName
        birthdate
        placeOfResidence
        contactPhone
        whoIsTheContact
        emailPhone
        gender
        firstSwimmingClass
        attendedDaycare
        immersesWithoutSwallowingWater
        bornPrematurely
        waterOnHisFaceBothersHim
        putYourFaceInTheWater
        anyIllnessInjuryMedicalCondition
        createdAt
        updatedAt
        studentSessionDetailId
        __typename
      }
      sessionType {
        id
        name
        description
        durationSession
        timeAWeek
        totalSessions
        amount
        packValidity
        createdAt
        updatedAt
        __typename
      }
      course {
        id
        title
        description
        startingAge
        endingAge
        ageType
        AgeGroupType
        duration
        isActive
        createdAt
        updatedAt
        locationCoursesId
        __typename
      }
      transaction {
        id
        amount
        date
        paymentMethod
        status
        createdAt
        updatedAt
        transactionEnrollmentId
        __typename
      }
      sessionDetails {
        nextToken
        __typename
      }
      createdAt
      updatedAt
      courseEnrollmentsId
      sessionTypeEnrollmentsId
      studentEnrollmentsId
      enrollmentTransactionId
      __typename
    }
  }
`;
export const onDeleteEnrollment = /* GraphQL */ `
  subscription OnDeleteEnrollment(
    $filter: ModelSubscriptionEnrollmentFilterInput
  ) {
    onDeleteEnrollment(filter: $filter) {
      id
      amountPaid
      startDate
      endDate
      wasPaid
      timeAWeek
      numberOfSessions
      sessionsLeft
      sessionsUsed
      scheduleId
      scheduleName
      student {
        id
        name
        lastName
        middleName
        birthdate
        placeOfResidence
        contactPhone
        whoIsTheContact
        emailPhone
        gender
        firstSwimmingClass
        attendedDaycare
        immersesWithoutSwallowingWater
        bornPrematurely
        waterOnHisFaceBothersHim
        putYourFaceInTheWater
        anyIllnessInjuryMedicalCondition
        createdAt
        updatedAt
        studentSessionDetailId
        __typename
      }
      sessionType {
        id
        name
        description
        durationSession
        timeAWeek
        totalSessions
        amount
        packValidity
        createdAt
        updatedAt
        __typename
      }
      course {
        id
        title
        description
        startingAge
        endingAge
        ageType
        AgeGroupType
        duration
        isActive
        createdAt
        updatedAt
        locationCoursesId
        __typename
      }
      transaction {
        id
        amount
        date
        paymentMethod
        status
        createdAt
        updatedAt
        transactionEnrollmentId
        __typename
      }
      sessionDetails {
        nextToken
        __typename
      }
      createdAt
      updatedAt
      courseEnrollmentsId
      sessionTypeEnrollmentsId
      studentEnrollmentsId
      enrollmentTransactionId
      __typename
    }
  }
`;
export const onCreateSessionDetail = /* GraphQL */ `
  subscription OnCreateSessionDetail(
    $filter: ModelSubscriptionSessionDetailFilterInput
  ) {
    onCreateSessionDetail(filter: $filter) {
      id
      date
      day
      month
      year
      sessionNumber
      totalSessions
      status
      proratedValue
      wasEmailSent
      locationId
      locationIdUsed
      student {
        id
        name
        lastName
        middleName
        birthdate
        placeOfResidence
        contactPhone
        whoIsTheContact
        emailPhone
        gender
        firstSwimmingClass
        attendedDaycare
        immersesWithoutSwallowingWater
        bornPrematurely
        waterOnHisFaceBothersHim
        putYourFaceInTheWater
        anyIllnessInjuryMedicalCondition
        createdAt
        updatedAt
        studentSessionDetailId
        __typename
      }
      createdAt
      updatedAt
      enrollmentSessionDetailsId
      sessionDetailStudentId
      __typename
    }
  }
`;
export const onUpdateSessionDetail = /* GraphQL */ `
  subscription OnUpdateSessionDetail(
    $filter: ModelSubscriptionSessionDetailFilterInput
  ) {
    onUpdateSessionDetail(filter: $filter) {
      id
      date
      day
      month
      year
      sessionNumber
      totalSessions
      status
      proratedValue
      wasEmailSent
      locationId
      locationIdUsed
      student {
        id
        name
        lastName
        middleName
        birthdate
        placeOfResidence
        contactPhone
        whoIsTheContact
        emailPhone
        gender
        firstSwimmingClass
        attendedDaycare
        immersesWithoutSwallowingWater
        bornPrematurely
        waterOnHisFaceBothersHim
        putYourFaceInTheWater
        anyIllnessInjuryMedicalCondition
        createdAt
        updatedAt
        studentSessionDetailId
        __typename
      }
      createdAt
      updatedAt
      enrollmentSessionDetailsId
      sessionDetailStudentId
      __typename
    }
  }
`;
export const onDeleteSessionDetail = /* GraphQL */ `
  subscription OnDeleteSessionDetail(
    $filter: ModelSubscriptionSessionDetailFilterInput
  ) {
    onDeleteSessionDetail(filter: $filter) {
      id
      date
      day
      month
      year
      sessionNumber
      totalSessions
      status
      proratedValue
      wasEmailSent
      locationId
      locationIdUsed
      student {
        id
        name
        lastName
        middleName
        birthdate
        placeOfResidence
        contactPhone
        whoIsTheContact
        emailPhone
        gender
        firstSwimmingClass
        attendedDaycare
        immersesWithoutSwallowingWater
        bornPrematurely
        waterOnHisFaceBothersHim
        putYourFaceInTheWater
        anyIllnessInjuryMedicalCondition
        createdAt
        updatedAt
        studentSessionDetailId
        __typename
      }
      createdAt
      updatedAt
      enrollmentSessionDetailsId
      sessionDetailStudentId
      __typename
    }
  }
`;
export const onCreateSupportTicket = /* GraphQL */ `
  subscription OnCreateSupportTicket(
    $filter: ModelSubscriptionSupportTicketFilterInput
  ) {
    onCreateSupportTicket(filter: $filter) {
      id
      name
      email
      phoneNumber
      description
      date
      day
      month
      year
      lastModificationUser
      statusTicket
      reason
      userTickets {
        nextToken
        __typename
      }
      ticketComments {
        nextToken
        __typename
      }
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const onUpdateSupportTicket = /* GraphQL */ `
  subscription OnUpdateSupportTicket(
    $filter: ModelSubscriptionSupportTicketFilterInput
  ) {
    onUpdateSupportTicket(filter: $filter) {
      id
      name
      email
      phoneNumber
      description
      date
      day
      month
      year
      lastModificationUser
      statusTicket
      reason
      userTickets {
        nextToken
        __typename
      }
      ticketComments {
        nextToken
        __typename
      }
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const onDeleteSupportTicket = /* GraphQL */ `
  subscription OnDeleteSupportTicket(
    $filter: ModelSubscriptionSupportTicketFilterInput
  ) {
    onDeleteSupportTicket(filter: $filter) {
      id
      name
      email
      phoneNumber
      description
      date
      day
      month
      year
      lastModificationUser
      statusTicket
      reason
      userTickets {
        nextToken
        __typename
      }
      ticketComments {
        nextToken
        __typename
      }
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const onCreateCommentTickets = /* GraphQL */ `
  subscription OnCreateCommentTickets(
    $filter: ModelSubscriptionCommentTicketsFilterInput
  ) {
    onCreateCommentTickets(filter: $filter) {
      id
      description
      statusModificationIdUser
      statusModificationUser
      ticketComments {
        nextToken
        __typename
      }
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const onUpdateCommentTickets = /* GraphQL */ `
  subscription OnUpdateCommentTickets(
    $filter: ModelSubscriptionCommentTicketsFilterInput
  ) {
    onUpdateCommentTickets(filter: $filter) {
      id
      description
      statusModificationIdUser
      statusModificationUser
      ticketComments {
        nextToken
        __typename
      }
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const onDeleteCommentTickets = /* GraphQL */ `
  subscription OnDeleteCommentTickets(
    $filter: ModelSubscriptionCommentTicketsFilterInput
  ) {
    onDeleteCommentTickets(filter: $filter) {
      id
      description
      statusModificationIdUser
      statusModificationUser
      ticketComments {
        nextToken
        __typename
      }
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const onCreateTransaction = /* GraphQL */ `
  subscription OnCreateTransaction(
    $filter: ModelSubscriptionTransactionFilterInput
  ) {
    onCreateTransaction(filter: $filter) {
      id
      amount
      date
      paymentMethod
      status
      enrollment {
        id
        amountPaid
        startDate
        endDate
        wasPaid
        timeAWeek
        numberOfSessions
        sessionsLeft
        sessionsUsed
        scheduleId
        scheduleName
        createdAt
        updatedAt
        courseEnrollmentsId
        sessionTypeEnrollmentsId
        studentEnrollmentsId
        enrollmentTransactionId
        __typename
      }
      createdAt
      updatedAt
      transactionEnrollmentId
      __typename
    }
  }
`;
export const onUpdateTransaction = /* GraphQL */ `
  subscription OnUpdateTransaction(
    $filter: ModelSubscriptionTransactionFilterInput
  ) {
    onUpdateTransaction(filter: $filter) {
      id
      amount
      date
      paymentMethod
      status
      enrollment {
        id
        amountPaid
        startDate
        endDate
        wasPaid
        timeAWeek
        numberOfSessions
        sessionsLeft
        sessionsUsed
        scheduleId
        scheduleName
        createdAt
        updatedAt
        courseEnrollmentsId
        sessionTypeEnrollmentsId
        studentEnrollmentsId
        enrollmentTransactionId
        __typename
      }
      createdAt
      updatedAt
      transactionEnrollmentId
      __typename
    }
  }
`;
export const onDeleteTransaction = /* GraphQL */ `
  subscription OnDeleteTransaction(
    $filter: ModelSubscriptionTransactionFilterInput
  ) {
    onDeleteTransaction(filter: $filter) {
      id
      amount
      date
      paymentMethod
      status
      enrollment {
        id
        amountPaid
        startDate
        endDate
        wasPaid
        timeAWeek
        numberOfSessions
        sessionsLeft
        sessionsUsed
        scheduleId
        scheduleName
        createdAt
        updatedAt
        courseEnrollmentsId
        sessionTypeEnrollmentsId
        studentEnrollmentsId
        enrollmentTransactionId
        __typename
      }
      createdAt
      updatedAt
      transactionEnrollmentId
      __typename
    }
  }
`;
export const onCreateUsers = /* GraphQL */ `
  subscription OnCreateUsers($filter: ModelSubscriptionUsersFilterInput) {
    onCreateUsers(filter: $filter) {
      id
      name
      email
      validated
      contactPhone
      ig
      firstContact
      emailSend {
        nextToken
        __typename
      }
      relationships {
        nextToken
        __typename
      }
      userTickets {
        nextToken
        __typename
      }
      roles {
        id
        name
        displayName
        icon
        createdAt
        updatedAt
        __typename
      }
      userPermissions {
        nextToken
        __typename
      }
      createdAt
      updatedAt
      usersRolesId
      __typename
    }
  }
`;
export const onUpdateUsers = /* GraphQL */ `
  subscription OnUpdateUsers($filter: ModelSubscriptionUsersFilterInput) {
    onUpdateUsers(filter: $filter) {
      id
      name
      email
      validated
      contactPhone
      ig
      firstContact
      emailSend {
        nextToken
        __typename
      }
      relationships {
        nextToken
        __typename
      }
      userTickets {
        nextToken
        __typename
      }
      roles {
        id
        name
        displayName
        icon
        createdAt
        updatedAt
        __typename
      }
      userPermissions {
        nextToken
        __typename
      }
      createdAt
      updatedAt
      usersRolesId
      __typename
    }
  }
`;
export const onDeleteUsers = /* GraphQL */ `
  subscription OnDeleteUsers($filter: ModelSubscriptionUsersFilterInput) {
    onDeleteUsers(filter: $filter) {
      id
      name
      email
      validated
      contactPhone
      ig
      firstContact
      emailSend {
        nextToken
        __typename
      }
      relationships {
        nextToken
        __typename
      }
      userTickets {
        nextToken
        __typename
      }
      roles {
        id
        name
        displayName
        icon
        createdAt
        updatedAt
        __typename
      }
      userPermissions {
        nextToken
        __typename
      }
      createdAt
      updatedAt
      usersRolesId
      __typename
    }
  }
`;
export const onCreateRelationship = /* GraphQL */ `
  subscription OnCreateRelationship(
    $filter: ModelSubscriptionRelationshipFilterInput
  ) {
    onCreateRelationship(filter: $filter) {
      id
      user {
        id
        name
        email
        validated
        contactPhone
        ig
        firstContact
        createdAt
        updatedAt
        usersRolesId
        __typename
      }
      student {
        id
        name
        lastName
        middleName
        birthdate
        placeOfResidence
        contactPhone
        whoIsTheContact
        emailPhone
        gender
        firstSwimmingClass
        attendedDaycare
        immersesWithoutSwallowingWater
        bornPrematurely
        waterOnHisFaceBothersHim
        putYourFaceInTheWater
        anyIllnessInjuryMedicalCondition
        createdAt
        updatedAt
        studentSessionDetailId
        __typename
      }
      relationType
      createdAt
      updatedAt
      studentRelationshipsId
      usersRelationshipsId
      __typename
    }
  }
`;
export const onUpdateRelationship = /* GraphQL */ `
  subscription OnUpdateRelationship(
    $filter: ModelSubscriptionRelationshipFilterInput
  ) {
    onUpdateRelationship(filter: $filter) {
      id
      user {
        id
        name
        email
        validated
        contactPhone
        ig
        firstContact
        createdAt
        updatedAt
        usersRolesId
        __typename
      }
      student {
        id
        name
        lastName
        middleName
        birthdate
        placeOfResidence
        contactPhone
        whoIsTheContact
        emailPhone
        gender
        firstSwimmingClass
        attendedDaycare
        immersesWithoutSwallowingWater
        bornPrematurely
        waterOnHisFaceBothersHim
        putYourFaceInTheWater
        anyIllnessInjuryMedicalCondition
        createdAt
        updatedAt
        studentSessionDetailId
        __typename
      }
      relationType
      createdAt
      updatedAt
      studentRelationshipsId
      usersRelationshipsId
      __typename
    }
  }
`;
export const onDeleteRelationship = /* GraphQL */ `
  subscription OnDeleteRelationship(
    $filter: ModelSubscriptionRelationshipFilterInput
  ) {
    onDeleteRelationship(filter: $filter) {
      id
      user {
        id
        name
        email
        validated
        contactPhone
        ig
        firstContact
        createdAt
        updatedAt
        usersRolesId
        __typename
      }
      student {
        id
        name
        lastName
        middleName
        birthdate
        placeOfResidence
        contactPhone
        whoIsTheContact
        emailPhone
        gender
        firstSwimmingClass
        attendedDaycare
        immersesWithoutSwallowingWater
        bornPrematurely
        waterOnHisFaceBothersHim
        putYourFaceInTheWater
        anyIllnessInjuryMedicalCondition
        createdAt
        updatedAt
        studentSessionDetailId
        __typename
      }
      relationType
      createdAt
      updatedAt
      studentRelationshipsId
      usersRelationshipsId
      __typename
    }
  }
`;
export const onCreateRolPermissions = /* GraphQL */ `
  subscription OnCreateRolPermissions(
    $filter: ModelSubscriptionRolPermissionsFilterInput
  ) {
    onCreateRolPermissions(filter: $filter) {
      id
      rolesId
      permissionsId
      roles {
        id
        name
        displayName
        icon
        createdAt
        updatedAt
        __typename
      }
      permissions {
        id
        displayName
        name
        icon
        order
        createdAt
        updatedAt
        permissionsSubmenuId
        __typename
      }
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const onUpdateRolPermissions = /* GraphQL */ `
  subscription OnUpdateRolPermissions(
    $filter: ModelSubscriptionRolPermissionsFilterInput
  ) {
    onUpdateRolPermissions(filter: $filter) {
      id
      rolesId
      permissionsId
      roles {
        id
        name
        displayName
        icon
        createdAt
        updatedAt
        __typename
      }
      permissions {
        id
        displayName
        name
        icon
        order
        createdAt
        updatedAt
        permissionsSubmenuId
        __typename
      }
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const onDeleteRolPermissions = /* GraphQL */ `
  subscription OnDeleteRolPermissions(
    $filter: ModelSubscriptionRolPermissionsFilterInput
  ) {
    onDeleteRolPermissions(filter: $filter) {
      id
      rolesId
      permissionsId
      roles {
        id
        name
        displayName
        icon
        createdAt
        updatedAt
        __typename
      }
      permissions {
        id
        displayName
        name
        icon
        order
        createdAt
        updatedAt
        permissionsSubmenuId
        __typename
      }
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const onCreateUserPermissions = /* GraphQL */ `
  subscription OnCreateUserPermissions(
    $filter: ModelSubscriptionUserPermissionsFilterInput
  ) {
    onCreateUserPermissions(filter: $filter) {
      id
      permissionsId
      usersId
      permissions {
        id
        displayName
        name
        icon
        order
        createdAt
        updatedAt
        permissionsSubmenuId
        __typename
      }
      users {
        id
        name
        email
        validated
        contactPhone
        ig
        firstContact
        createdAt
        updatedAt
        usersRolesId
        __typename
      }
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const onUpdateUserPermissions = /* GraphQL */ `
  subscription OnUpdateUserPermissions(
    $filter: ModelSubscriptionUserPermissionsFilterInput
  ) {
    onUpdateUserPermissions(filter: $filter) {
      id
      permissionsId
      usersId
      permissions {
        id
        displayName
        name
        icon
        order
        createdAt
        updatedAt
        permissionsSubmenuId
        __typename
      }
      users {
        id
        name
        email
        validated
        contactPhone
        ig
        firstContact
        createdAt
        updatedAt
        usersRolesId
        __typename
      }
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const onDeleteUserPermissions = /* GraphQL */ `
  subscription OnDeleteUserPermissions(
    $filter: ModelSubscriptionUserPermissionsFilterInput
  ) {
    onDeleteUserPermissions(filter: $filter) {
      id
      permissionsId
      usersId
      permissions {
        id
        displayName
        name
        icon
        order
        createdAt
        updatedAt
        permissionsSubmenuId
        __typename
      }
      users {
        id
        name
        email
        validated
        contactPhone
        ig
        firstContact
        createdAt
        updatedAt
        usersRolesId
        __typename
      }
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const onCreateCourseSessionType = /* GraphQL */ `
  subscription OnCreateCourseSessionType(
    $filter: ModelSubscriptionCourseSessionTypeFilterInput
  ) {
    onCreateCourseSessionType(filter: $filter) {
      id
      courseId
      sessionTypeId
      course {
        id
        title
        description
        startingAge
        endingAge
        ageType
        AgeGroupType
        duration
        isActive
        createdAt
        updatedAt
        locationCoursesId
        __typename
      }
      sessionType {
        id
        name
        description
        durationSession
        timeAWeek
        totalSessions
        amount
        packValidity
        createdAt
        updatedAt
        __typename
      }
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const onUpdateCourseSessionType = /* GraphQL */ `
  subscription OnUpdateCourseSessionType(
    $filter: ModelSubscriptionCourseSessionTypeFilterInput
  ) {
    onUpdateCourseSessionType(filter: $filter) {
      id
      courseId
      sessionTypeId
      course {
        id
        title
        description
        startingAge
        endingAge
        ageType
        AgeGroupType
        duration
        isActive
        createdAt
        updatedAt
        locationCoursesId
        __typename
      }
      sessionType {
        id
        name
        description
        durationSession
        timeAWeek
        totalSessions
        amount
        packValidity
        createdAt
        updatedAt
        __typename
      }
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const onDeleteCourseSessionType = /* GraphQL */ `
  subscription OnDeleteCourseSessionType(
    $filter: ModelSubscriptionCourseSessionTypeFilterInput
  ) {
    onDeleteCourseSessionType(filter: $filter) {
      id
      courseId
      sessionTypeId
      course {
        id
        title
        description
        startingAge
        endingAge
        ageType
        AgeGroupType
        duration
        isActive
        createdAt
        updatedAt
        locationCoursesId
        __typename
      }
      sessionType {
        id
        name
        description
        durationSession
        timeAWeek
        totalSessions
        amount
        packValidity
        createdAt
        updatedAt
        __typename
      }
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const onCreateTicketUser = /* GraphQL */ `
  subscription OnCreateTicketUser(
    $filter: ModelSubscriptionTicketUserFilterInput
  ) {
    onCreateTicketUser(filter: $filter) {
      id
      supportTicketId
      usersId
      supportTicket {
        id
        name
        email
        phoneNumber
        description
        date
        day
        month
        year
        lastModificationUser
        statusTicket
        reason
        createdAt
        updatedAt
        __typename
      }
      users {
        id
        name
        email
        validated
        contactPhone
        ig
        firstContact
        createdAt
        updatedAt
        usersRolesId
        __typename
      }
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const onUpdateTicketUser = /* GraphQL */ `
  subscription OnUpdateTicketUser(
    $filter: ModelSubscriptionTicketUserFilterInput
  ) {
    onUpdateTicketUser(filter: $filter) {
      id
      supportTicketId
      usersId
      supportTicket {
        id
        name
        email
        phoneNumber
        description
        date
        day
        month
        year
        lastModificationUser
        statusTicket
        reason
        createdAt
        updatedAt
        __typename
      }
      users {
        id
        name
        email
        validated
        contactPhone
        ig
        firstContact
        createdAt
        updatedAt
        usersRolesId
        __typename
      }
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const onDeleteTicketUser = /* GraphQL */ `
  subscription OnDeleteTicketUser(
    $filter: ModelSubscriptionTicketUserFilterInput
  ) {
    onDeleteTicketUser(filter: $filter) {
      id
      supportTicketId
      usersId
      supportTicket {
        id
        name
        email
        phoneNumber
        description
        date
        day
        month
        year
        lastModificationUser
        statusTicket
        reason
        createdAt
        updatedAt
        __typename
      }
      users {
        id
        name
        email
        validated
        contactPhone
        ig
        firstContact
        createdAt
        updatedAt
        usersRolesId
        __typename
      }
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const onCreateComments = /* GraphQL */ `
  subscription OnCreateComments($filter: ModelSubscriptionCommentsFilterInput) {
    onCreateComments(filter: $filter) {
      id
      supportTicketId
      commentTicketsId
      supportTicket {
        id
        name
        email
        phoneNumber
        description
        date
        day
        month
        year
        lastModificationUser
        statusTicket
        reason
        createdAt
        updatedAt
        __typename
      }
      commentTickets {
        id
        description
        statusModificationIdUser
        statusModificationUser
        createdAt
        updatedAt
        __typename
      }
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const onUpdateComments = /* GraphQL */ `
  subscription OnUpdateComments($filter: ModelSubscriptionCommentsFilterInput) {
    onUpdateComments(filter: $filter) {
      id
      supportTicketId
      commentTicketsId
      supportTicket {
        id
        name
        email
        phoneNumber
        description
        date
        day
        month
        year
        lastModificationUser
        statusTicket
        reason
        createdAt
        updatedAt
        __typename
      }
      commentTickets {
        id
        description
        statusModificationIdUser
        statusModificationUser
        createdAt
        updatedAt
        __typename
      }
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const onDeleteComments = /* GraphQL */ `
  subscription OnDeleteComments($filter: ModelSubscriptionCommentsFilterInput) {
    onDeleteComments(filter: $filter) {
      id
      supportTicketId
      commentTicketsId
      supportTicket {
        id
        name
        email
        phoneNumber
        description
        date
        day
        month
        year
        lastModificationUser
        statusTicket
        reason
        createdAt
        updatedAt
        __typename
      }
      commentTickets {
        id
        description
        statusModificationIdUser
        statusModificationUser
        createdAt
        updatedAt
        __typename
      }
      createdAt
      updatedAt
      __typename
    }
  }
`;
