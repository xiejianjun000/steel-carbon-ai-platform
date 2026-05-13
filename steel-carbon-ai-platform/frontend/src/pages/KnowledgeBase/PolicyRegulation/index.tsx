import { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, Typography, Table, TableHead, TableRow,
  TableCell, TableBody, Chip, TablePagination, Tabs, Tab, Button,
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { getDocuments, uploadDocument } from '../../services/knowledge';

const categories: Record<string, string> = {
  POLICY: '政策法规',
  STANDARD: '标准规范',
  GUIDE: '行业指南',
  ENTERPRISE: '企业文件',
};

/**
 * 政策法规管理页面 - 知识库文档管理
 */
export default function PolicyRegulation() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [tab, setTab] = useState('ALL');
  const [loading, setLoading] = useState(false);

  useEffect(() => { loadDocuments(); }, [tab, page]);

  const loadDocuments = async () => {
    setLoading(true);
    try {
      const res: any = await getDocuments({
        category: tab === 'ALL' ? undefined : tab,
        page: page + 1,
        pageSize: 10,
      });
      if (res.code === 200) {
        setDocuments(res.data.list || []);
        setTotal(res.data.total || 0);
      } else {
        setDocuments([
          { id: 1, title: 'GB/T 32150-2025《工业企业温室气体排放核算和报告通则》', category: 'STANDARD', docType: 'PDF', publishedAt: '2025-12-31' },
          { id: 2, title: 'GB/T 32151.5-2026《温室气体排放核算与报告要求 第5部分：钢铁生产企业》', category: 'STANDARD', docType: 'PDF', publishedAt: '2026-03-31' },
          { id: 3, title: '全国碳排放权交易管理条例', category: 'POLICY', docType: 'DOCX', publishedAt: '2024-05-01' },
          { id: 4, title: 'CBAM碳边境调节机制过渡期实施细则', category: 'POLICY', docType: 'PDF', publishedAt: '2023-10-01' },
          { id: 5, title: '钢铁行业碳达峰实施方案', category: 'GUIDE', docType: 'PDF', publishedAt: '2022-02-01' },
          { id: 6, title: '冷钢碳排放管理办法（内部）', category: 'ENTERPRISE', docType: 'DOCX', publishedAt: '2024-01-15' },
        ]);
        setTotal(6);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      await uploadDocument(formData);
      loadDocuments();
    } catch { /* ignore */ }
  };

  return (
    <Box>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">知识库文档管理</Typography>
            <Button variant="contained" startIcon={<UploadFileIcon />} component="label">
              上传文档
              <input type="file" hidden accept=".pdf,.docx,.xlsx" onChange={handleUpload} />
            </Button>
          </Box>

          <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
            <Tab value="ALL" label="全部" />
            <Tab value="POLICY" label="政策法规" />
            <Tab value="STANDARD" label="标准规范" />
            <Tab value="GUIDE" label="行业指南" />
            <Tab value="ENTERPRISE" label="企业文件" />
          </Tabs>

          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>文档标题</TableCell>
                <TableCell>分类</TableCell>
                <TableCell>类型</TableCell>
                <TableCell>发布日期</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {documents.map((doc) => (
                <TableRow key={doc.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold" sx={{ cursor: 'pointer', '&:hover': { color: 'primary.main' } }}>
                      {doc.title}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip size="small" label={categories[doc.category] || doc.category} variant="outlined" />
                  </TableCell>
                  <TableCell>
                    <Chip size="small" label={doc.docType} color={doc.docType === 'PDF' ? 'error' : 'primary'} variant="outlined" />
                  </TableCell>
                  <TableCell>{doc.publishedAt}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            count={total}
            page={page}
            onPageChange={(_, p) => setPage(p)}
            rowsPerPage={10}
            rowsPerPageOptions={[10, 20]}
          />
        </CardContent>
      </Card>
    </Box>
  );
}
