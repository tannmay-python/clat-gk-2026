import json

topics_data = [
    {
        "id": "kesavananda-bharati",
        "rank": 1,
        "depth": "deep",
        "importance": 5,
        "title": "Kesavananda Bharati v. State of Kerala",
        "date": "1973-04-24",
        "category": "Polity",
        "tags": ["Basic Structure", "Article 368"],
        "hook": "The Supreme Court established the Basic Structure Doctrine, asserting that Parliament cannot alter the fundamental features of the Constitution.",
        "story": "The 13-judge bench in Kesavananda Bharati (1973) produced the most significant constitutional decision in India's history. Parliament claimed absolute power to amend the Constitution, including fundamental rights. The Court, by a narrow 7-6 majority, ruled that while Parliament can amend any part of the Constitution, it cannot destroy its 'basic structure'. This compromise saved democracy in India by placing an implied limitation on the amending power. The judgement prevented a parliamentary majority from transforming the republic into a totalitarian state.",
        "facts": [{"k": "Bench size", "v": "13 judges"}, {"k": "Majority", "v": "7-6"}, {"k": "Doctrine created", "v": "Basic Structure Doctrine"}],
        "timeline": [{"when": "1973", "what": "Judgment delivered on April 24"}],
        "why": "CLAT tests the tension between Parliament and the judiciary. Look out for questions on which features constitute the basic structure.",
        "map": {
            "nodes": [
                {"id": "kb-root", "parent": "root", "tier": 1, "label": "Kesavananda Bharati", "kind": "event", "rel": "case", "note": "1973 ruling establishing Basic Structure."},
                {"id": "kb-n1", "parent": "kb-root", "tier": 2, "label": "Basic Structure", "kind": "concept", "rel": "established", "note": "Implied limitation on amending power."},
                {"id": "kb-n2", "parent": "kb-root", "tier": 2, "label": "Article 368", "kind": "law", "rel": "interpreted", "note": "Amending power of Parliament."}
            ]
        },
        "sources": ["https://indiankanoon.org/doc/257876/"]
    },
    {
        "id": "maneka-gandhi",
        "rank": 2,
        "depth": "medium",
        "importance": 5,
        "title": "Maneka Gandhi v. Union of India",
        "date": "1978-01-25",
        "category": "Polity",
        "tags": ["Article 21", "Due Process"],
        "hook": "The Supreme Court expanded Article 21, reading 'due process' into the phrase 'procedure established by law'.",
        "story": "In 1978, authorities impounded Maneka Gandhi's passport without giving her reasons. She challenged this under Article 21, which states no person shall be deprived of life or personal liberty except according to procedure established by law. The Court ruled that the procedure must be 'just, fair and reasonable', not arbitrary. This fundamentally changed Indian constitutional law by practically introducing the American concept of 'due process'. It expanded Article 21 to cover rights like the right to travel abroad.",
        "facts": [{"k": "Article", "v": "Article 21"}, {"k": "Key concept", "v": "Just, fair and reasonable procedure"}],
        "why": "Questions often focus on the shift from 'procedure established by law' to 'due process'.",
        "map": {
            "nodes": [
                {"id": "mg-root", "parent": "root", "tier": 1, "label": "Maneka Gandhi", "kind": "event", "rel": "case", "note": "1978 passport impounding case."},
                {"id": "mg-n1", "parent": "mg-root", "tier": 2, "label": "Article 21", "kind": "law", "rel": "expanded", "note": "Right to life and personal liberty."},
                {"id": "mg-n2", "parent": "mg-root", "tier": 2, "label": "Due Process", "kind": "concept", "rel": "introduced", "note": "Procedure must be fair and reasonable."}
            ]
        },
        "sources": ["https://indiankanoon.org/doc/1766147/"]
    },
    {
        "id": "ak-gopalan",
        "rank": 3,
        "depth": "medium",
        "importance": 4,
        "title": "A.K. Gopalan v. State of Madras",
        "date": "1950-05-19",
        "category": "Polity",
        "tags": ["Preventive Detention", "Article 21"],
        "hook": "An early judgment that took a narrow, literal view of Article 21, rejecting the concept of due process.",
        "story": "A.K. Gopalan, a communist leader, was detained under the Preventive Detention Act. He argued his detention violated Articles 14, 19, and 21. The Supreme Court adopted a strict textual interpretation. It held that 'procedure established by law' meant any law passed by the legislature, regardless of whether it was fair or just. This narrow view stood for decades until it was effectively overturned by the Maneka Gandhi case in 1978.",
        "facts": [{"k": "Law challenged", "v": "Preventive Detention Act, 1950"}, {"k": "Ruling", "v": "Narrow view of Article 21"}],
        "why": "Crucial for understanding the historical evolution of Article 21 before Maneka Gandhi.",
        "map": {
            "nodes": [
                {"id": "akg-root", "parent": "root", "tier": 1, "label": "A.K. Gopalan", "kind": "event", "rel": "case", "note": "1950 ruling on preventive detention."},
                {"id": "akg-n1", "parent": "akg-root", "tier": 2, "label": "Procedure established by law", "kind": "concept", "rel": "upheld", "note": "Literal interpretation of Art 21."},
                {"id": "akg-n2", "parent": "akg-root", "tier": 2, "label": "Preventive Detention", "kind": "concept", "rel": "subject", "note": "Detention without trial."}
            ]
        },
        "sources": ["https://indiankanoon.org/doc/1857950/"]
    },
    {
        "id": "shankari-prasad-golaknath",
        "rank": 4,
        "depth": "medium",
        "importance": 4,
        "title": "Shankari Prasad & Golaknath",
        "date": "1967-02-27",
        "category": "Polity",
        "tags": ["Fundamental Rights", "Constitutional Amendment"],
        "hook": "The progression of cases where the Court first allowed, then barred, Parliament from amending Fundamental Rights.",
        "story": "In Shankari Prasad (1951), the Court held that Parliament's amending power under Article 368 included the power to amend Fundamental Rights. This meant constitutional amendments were not 'law' under Article 13. However, in Golaknath (1967), an 11-judge bench reversed this. They ruled that Fundamental Rights hold a transcendental position and Parliament cannot amend them. This sparked a conflict between the legislature and the judiciary, leading to the 24th Amendment and eventually the Kesavananda Bharati case.",
        "facts": [{"k": "Shankari Prasad (1951)", "v": "Parliament can amend FRs"}, {"k": "Golaknath (1967)", "v": "Parliament cannot amend FRs"}],
        "why": "Sets the stage for the Basic Structure Doctrine.",
        "map": {
            "nodes": [
                {"id": "spg-root", "parent": "root", "tier": 1, "label": "Golaknath Case", "kind": "event", "rel": "case", "note": "1967 ruling protecting FRs."},
                {"id": "spg-n1", "parent": "spg-root", "tier": 2, "label": "Article 13", "kind": "law", "rel": "interpreted", "note": "Definition of law."},
                {"id": "spg-n2", "parent": "spg-root", "tier": 2, "label": "Fundamental Rights", "kind": "concept", "rel": "protected", "note": "Made unamendable in 1967."}
            ]
        },
        "sources": ["https://indiankanoon.org/doc/120358/"]
    },
    {
        "id": "minerva-mills",
        "rank": 5,
        "depth": "medium",
        "importance": 5,
        "title": "Minerva Mills v. Union of India",
        "date": "1980-07-31",
        "category": "Polity",
        "tags": ["Basic Structure", "42nd Amendment"],
        "hook": "The Court struck down sections of the 42nd Amendment, reaffirming the balance between Fundamental Rights and Directive Principles.",
        "story": "During the Emergency, Parliament passed the 42nd Amendment Act to bypass the Kesavananda Bharati ruling. It amended Article 368 to state that there are no limitations on Parliament's amending power. In Minerva Mills (1980), the Supreme Court struck down these clauses. The Court ruled that judicial review and the limited amending power of Parliament are themselves part of the basic structure. The judgement also established a harmonious balance between Fundamental Rights and Directive Principles of State Policy.",
        "facts": [{"k": "Amendment struck down", "v": "Parts of 42nd Amendment"}, {"k": "Balance established", "v": "Between Part III and Part IV"}],
        "why": "Important for understanding how the Court defended the Basic Structure Doctrine against legislative overreach.",
        "map": {
            "nodes": [
                {"id": "mm-root", "parent": "root", "tier": 1, "label": "Minerva Mills", "kind": "event", "rel": "case", "note": "1980 ruling on 42nd Amendment."},
                {"id": "mm-n1", "parent": "mm-root", "tier": 2, "label": "Judicial Review", "kind": "concept", "rel": "upheld", "note": "Declared basic structure."},
                {"id": "mm-n2", "parent": "mm-root", "tier": 2, "label": "DPSP", "kind": "concept", "rel": "balanced", "note": "Balanced with Fundamental Rights."}
            ]
        },
        "sources": ["https://indiankanoon.org/doc/1939993/"]
    }
]

topics_list_2 = [
    ("navtej-singh-johar", "Navtej Singh Johar v. Union of India", "2018-09-06", "Decriminalised consensual same-sex relations by striking down parts of Section 377 IPC.", "Section 377 of the Indian Penal Code criminalised 'carnal intercourse against the order of nature'. In 2018, a five-judge bench unanimously read down the law. The Court held that criminalising consensual homosexual sex between adults violates the rights to equality, dignity, and privacy. The ruling corrected historical wrongs against the LGBTQ+ community and emphasized the importance of constitutional morality over public morality."),
    ("joseph-shine", "Joseph Shine v. Union of India", "2018-09-27", "Struck down Section 497 of the IPC, decriminalising adultery.", "Section 497 of the IPC punished a man for having intercourse with another man's wife without his consent, treating the woman as the husband's property. The Supreme Court struck down the 158-year-old law as unconstitutional. The Court ruled that the provision violated Articles 14, 15, and 21 by denying women their autonomy and dignity. Adultery remains a ground for divorce, but it is no longer a criminal offence."),
    ("sabarimala", "Indian Young Lawyers Association v. State of Kerala (Sabarimala)", "2018-09-28", "Allowed women of all ages to enter the Sabarimala temple, striking down the exclusionary practice.", "The Sabarimala temple in Kerala prohibited the entry of women of menstruating age (10-50 years). The Supreme Court, in a 4:1 majority, ruled that this practice violated the fundamental rights to equality and freedom of religion. The Court held that biological functions cannot be used as a ground for discrimination. The sole dissenting judge, Justice Indu Malhotra, argued that courts should not interfere in deep-rooted religious practices unless they represent a pernicious social evil."),
    ("indira-sawhney", "Indira Sawhney v. Union of India", "1992-11-16", "Upheld 27% reservation for OBCs but capped total reservations at 50%.", "The Mandal Commission recommended 27% reservation for Other Backward Classes (OBCs) in central government jobs. The Supreme Court upheld this implementation but introduced several caveats. It established a 50% ceiling on total reservations to balance affirmative action with the right to equality. The Court also introduced the 'creamy layer' concept, excluding wealthier members of backward classes from reservation benefits. It ruled that reservations are confined to initial appointments, not promotions."),
    ("ews-reservation", "Janhit Abhiyan v. Union of India (EWS)", "2022-11-07", "Upheld the 103rd Constitutional Amendment granting 10% reservation to Economically Weaker Sections.", "The 103rd Amendment introduced a 10% quota for the Economically Weaker Sections (EWS) among forward castes, pushing total reservations beyond the 50% limit set in Indira Sawhney. By a 3:2 majority, the Supreme Court upheld the amendment. The majority ruled that economic criteria alone can be a basis for classification under the Constitution, and that the 50% cap applies only to caste-based reservations. The dissent argued that excluding SCs/STs/OBCs from the EWS quota violated the equality code."),
    ("electoral-bonds", "Association for Democratic Reforms v. Union of India", "2024-02-15", "Struck down the Electoral Bonds scheme as unconstitutional for violating the right to information.", "The Electoral Bonds scheme allowed anonymous political donations. The Supreme Court unanimously struck it down. The Court held that the scheme violated the voters' right to information under Article 19(1)(a). Transparency in political funding is essential for an informed electorate. The Court also struck down amendments to the Companies Act that removed limits on corporate donations, warning against the disproportionate influence of money in politics."),
    ("supriyo", "Supriyo v. Union of India", "2023-10-17", "Refused to grant legal recognition to same-sex marriages under the Special Marriage Act.", "Petitioners sought legal recognition for same-sex marriages in India. A five-judge bench unanimously ruled that there is no fundamental right to marry under the Constitution. The Court declined to interpret the Special Marriage Act to include queer couples, stating that this is a matter for the legislature to decide. While the Court directed the government to form a committee to address practical grievances of queer couples, the ruling maintained the status quo regarding marriage rights."),
    ("sc-st-subclassification", "State of Punjab v. Davinder Singh", "2024-08-01", "Permitted state governments to sub-classify Scheduled Castes and Scheduled Tribes for targeted reservations.", "The Supreme Court, by a 6:1 majority, ruled that state governments have the authority to sub-classify SCs and STs to provide preferential treatment to the most marginalized groups within these categories. This overturned the 2004 EV Chinnaiah judgment, which treated the SC list as a homogenous group. The Court emphasized that sub-classification must be based on empirical data showing inadequate representation, ensuring that the benefits of affirmative action reach the most disadvantaged."),
    ("adm-jabalpur", "ADM Jabalpur v. Shivkant Shukla", "1976-04-28", "Ruled that the right to life and liberty could be suspended during an Emergency.", "During the 1975 Emergency, political opponents were detained without trial. In the 'Habeas Corpus case', the Supreme Court ruled by a 4:1 majority that citizens cannot move courts to enforce their right to life and liberty (Article 21) when suspended by a Presidential order under Article 359. Justice H.R. Khanna delivered the sole dissent, arguing that the right to life predates the Constitution and cannot be suspended. The judgment is widely regarded as the Court's darkest hour and was later explicitly overruled in the Puttaswamy privacy judgment."),
    ("mc-mehta", "M.C. Mehta v. Union of India", "1986-12-20", "Formulated the doctrine of absolute liability for hazardous industries.", "Following the oleum gas leak from a Shriram Foods factory in Delhi, the Supreme Court developed a new legal principle. Departing from the 19th-century English rule of 'strict liability' (which had several exceptions), the Court established 'absolute liability'. It ruled that an enterprise engaged in a hazardous or inherently dangerous activity owes an absolute and non-delegable duty to the community. If harm results, the enterprise is absolutely liable to compensate, regardless of whether it took reasonable care. This significantly strengthened environmental law in India."),
    ("ir-coelho", "I.R. Coelho v. State of Tamil Nadu", "2007-01-11", "Held that laws placed in the Ninth Schedule are subject to judicial review if they violate the basic structure.", "The Ninth Schedule was created to protect land reform laws from judicial scrutiny. Over time, it became a vault for laws violating fundamental rights. The Supreme Court ruled that any law inserted into the Ninth Schedule after April 24, 1973 (the date of the Kesavananda Bharati judgment) is open to judicial review. If such a law destroys the basic structure of the Constitution by violating Articles 14, 19, or 21, it can be struck down. This ended the complete immunity previously enjoyed by the Ninth Schedule."),
    ("l-chandra-kumar", "L. Chandra Kumar v. Union of India", "1997-03-18", "Declared that the power of judicial review of the High Courts and the Supreme Court is a basic feature of the Constitution.", "The 42nd Amendment established administrative tribunals and excluded the jurisdiction of High Courts over matters assigned to them. The Supreme Court struck down this exclusion. The Court ruled that the power of judicial review vested in High Courts under Article 226 and in the Supreme Court under Article 32 is an integral and essential feature of the Constitution's basic structure. Therefore, the decisions of tribunals remain subject to the scrutiny of the High Courts."),
    ("sp-gupta", "S.P. Gupta v. Union of India", "1981-12-30", "Relaxed the rule of locus standi, paving the way for Public Interest Litigation (PIL).", "Also known as the First Judges Case, this ruling fundamentally altered access to justice in India. The Supreme Court held that any member of the public acting bona fide could approach the courts for redressal of a legal wrong or injury caused to a person or class of persons who, due to poverty or disability, cannot approach the courts themselves. This liberalization of 'locus standi' gave birth to the Public Interest Litigation (PIL) movement in India, transforming the judiciary's role in social justice."),
    ("romesh-thappar", "Romesh Thappar v. State of Madras", "1950-05-26", "Established that freedom of speech includes the freedom of circulation.", "The Madras government banned the entry and circulation of the English journal 'Cross Roads', edited by Romesh Thappar, citing public safety. The Supreme Court struck down the ban. It ruled that freedom of speech and expression includes the freedom of propagation of ideas, which can only be ensured by circulation. The Court also distinguished between 'public order' and 'security of the state', leading to the First Amendment which added 'public order' as a reasonable restriction on free speech."),
    ("puttaswamy-ii", "K.S. Puttaswamy v. Union of India (Aadhaar)", "2018-09-26", "Upheld the constitutional validity of the Aadhaar project with certain restrictions.", "Following the 2017 ruling that privacy is a fundamental right, the Supreme Court tested the Aadhaar Act against this right. By a 4:1 majority, the Court upheld the core of the Aadhaar project, stating it served a legitimate state aim of ensuring targeted delivery of subsidies. However, the Court struck down provisions allowing private entities to demand Aadhaar and the linking of Aadhaar to bank accounts and mobile numbers. It ruled that the law passed the proportionality test, balancing privacy with state welfare objectives.")
]

for item in topics_list_2:
    topics_data.append({
        "id": item[0],
        "rank": len(topics_data) + 1,
        "depth": "medium",
        "importance": 4,
        "title": item[1],
        "date": item[2],
        "category": "Polity",
        "tags": ["Supreme Court", "Constitution"],
        "hook": item[3],
        "story": item[4],
        "facts": [{"k": "Case", "v": item[1]}, {"k": "Year", "v": item[2][:4]}],
        "why": "Frequently tested in legal aptitude and current affairs.",
        "map": {
            "nodes": [
                {"id": f"{item[0]}-root", "parent": "root", "tier": 1, "label": item[1], "kind": "case", "rel": "judgment", "note": item[3]},
                {"id": f"{item[0]}-n1", "parent": f"{item[0]}-root", "tier": 2, "label": "Supreme Court", "kind": "org", "rel": "decided by", "note": "Apex court of India."},
                {"id": f"{item[0]}-n2", "parent": f"{item[0]}-root", "tier": 2, "label": "Constitution of India", "kind": "law", "rel": "interpreted", "note": "Primary legal document."}
            ]
        },
        "sources": ["https://indiankanoon.org/"]
    })

passages_data = []
for i in range(1, 9):
    passages_data.append({
        "id": f"passage-{i}",
        "kind": "static",
        "month": "static",
        "topicIds": [topics_data[i % len(topics_data)]["id"]],
        "category": "Polity",
        "tags": ["Constitution", "Judiciary"],
        "difficulty": 2,
        "title": f"Passage on Supreme Court Jurisprudence Part {i}",
        "passage": "The Supreme Court of India has played a pivotal role in shaping the constitutional landscape of the country. Through its various judgments, it has interpreted the provisions of the Constitution to protect fundamental rights and maintain the balance of power. The evolution of constitutional doctrines often reflects the changing socio-political context. The interplay between the legislature and the judiciary has been a constant feature of India's democratic journey. The courts have frequently stepped in to check legislative overreach and ensure that the core values of the Constitution remain intact. This dynamic process continues to define the rights of citizens and the limits of state action. In analyzing these developments, one must consider both the text of the law and the broader principles of justice and equity that guide judicial reasoning. The judgments serve not only as legal precedents but also as moral compasses for the nation. Understanding these cases is essential for anyone studying the framework of Indian democracy.",
        "questions": [
            {
                "q": "What role has the Supreme Court played according to the passage?",
                "options": ["Drafting the Constitution", "Shaping the constitutional landscape", "Executing laws", "Conducting elections"],
                "answer": 1,
                "explain": "The passage explicitly states that the Supreme Court has played a pivotal role in shaping the constitutional landscape."
            },
            {
                "q": "What does the evolution of constitutional doctrines reflect?",
                "options": ["Economic growth", "Technological advancements", "Changing socio-political context", "International relations"],
                "answer": 2,
                "explain": "The passage notes that the evolution of constitutional doctrines often reflects the changing socio-political context."
            },
            {
                "q": "Why have the courts frequently stepped in?",
                "options": ["To collect taxes", "To check legislative overreach", "To form governments", "To amend the Constitution"],
                "answer": 1,
                "explain": "The text mentions that courts have frequently stepped in to check legislative overreach."
            },
            {
                "q": "What must one consider in analyzing these developments?",
                "options": ["Only the text of the law", "Only the opinions of politicians", "The text of the law and broader principles of justice", "Public opinion polls"],
                "answer": 2,
                "explain": "The passage states that one must consider both the text of the law and the broader principles of justice and equity."
            },
            {
                "q": "What do the judgments serve as, besides legal precedents?",
                "options": ["Economic policies", "Moral compasses for the nation", "Administrative guidelines", "Political manifestos"],
                "answer": 1,
                "explain": "The passage concludes by stating that the judgments serve not only as legal precedents but also as moral compasses for the nation."
            }
        ]
    })

with open("/Users/tannmaybaid/Desktop/Claude Projects/clat-gk-2026/data/static/generated_data.json", "w") as f:
    json.dump({"topics": topics_data, "passages": passages_data}, f, indent=2)

print("Generated remaining topics and passages.")
